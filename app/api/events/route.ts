import {NextRequest, NextResponse} from "next/server";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';
import EventCreationLog from '@/database/eventCreationLog.model';

function getClientIp(req: NextRequest): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) {
        return xff.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp;
    // Fallback to request IP from Next URL if available
    return req.ip ?? 'unknown';
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Basic same-origin check to mitigate CSRF on simple forms
        const origin = req.headers.get('origin');
        const expectedOrigin = req.nextUrl.origin;
        if (origin && expectedOrigin && origin !== expectedOrigin) {
            return NextResponse.json({ message: 'Forbidden: invalid origin' }, { status: 403 });
        }

        // Rate limit: allow only 1 create per hour per IP
        const ip = getClientIp(req);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recent = await EventCreationLog.findOne({ ip, createdAt: { $gte: oneHourAgo } }).lean();
        if (recent) {
            const retryAfterSeconds = 60 * 60; // 1 hour
            const res = NextResponse.json({ message: 'Rate limit exceeded: You can create only one event per hour.' }, { status: 429 });
            res.headers.set('Retry-After', String(retryAfterSeconds));
            return res;
        }

        const formData = await req.formData();

        // Honeypot check (bots tend to fill hidden fields)
        const honeypot = formData.get('company');
        if (honeypot && String(honeypot).trim().length > 0) {
            return NextResponse.json({ message: 'Bad Request' }, { status: 400 });
        }

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid JSON data format'}, { status: 400 })
        }

        const file = formData.get('image') as File;

        if(!file) return NextResponse.json({ message: 'Image file is required'}, { status: 400 })

        // Validate file type and size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        const mime = (file as any).type || '';
        if (!mime.startsWith('image/')) {
            return NextResponse.json({ message: 'Invalid image type' }, { status: 400 });
        }
        if ((file as any).size && (file as any).size > maxSize) {
            return NextResponse.json({ message: 'Image too large. Max 5MB.' }, { status: 400 });
        }

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if(error) return reject(error);

                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        // Log successful creation for rate limiting
        await EventCreationLog.create({ ip });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown'}, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}