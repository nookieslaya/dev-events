import React, { Suspense } from 'react'
import { notFound } from "next/navigation";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/events.actions";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string; }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>{tag}</div>
        ))}
    </div>
)

// Isolate similar events fetching inside its own async component wrapped by Suspense
const SimilarEvents = async ({ slug }: { slug: string }) => {
    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
    if (!similarEvents || similarEvents.length === 0) {
        return null;
    }
    return (
        <div className="events">
            {similarEvents.map((similarEvent: IEvent) => (
                <EventCard key={similarEvent.title} {...similarEvent} />
            ))}
        </div>
    );
};

const EventDetails = async ({ slug }: { slug: string }) => {
    // Avoid aggressive caching during development; rely on ISR from callers if needed
    let event: any;
    try {
        const url = `${BASE_URL ? BASE_URL : ''}/api/events/${encodeURIComponent(slug)}`;
        const request = await fetch(url, { next: { revalidate: 60 } });

        if (!request.ok) {
            if (request.status === 404) {
                return notFound();
            }
            // For non-404 errors, render a friendly fallback instead of 404
            return (
                <section id="event">
                    <div className="header">
                        <h1>Event Unavailable</h1>
                        <p>We couldn't load this event right now. Please try again later.</p>
                    </div>
                </section>
            );
        }

        const response = await request.json();
        event = response.event;

        if (!event) {
            return notFound();
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        // Graceful fallback for network/unknown errors
        return (
            <section id="event">
                <div className="header">
                    <h1>Event Unavailable</h1>
                    <p>We couldn't load this event right now. Please try again later.</p>
                </div>
            </section>
        );
    }

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

    if (!description) return notFound();

    const bookings = 10;

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p>{description}</p>
            </div>

            <div className="details">
                {/*    Left Side - Event Content */}
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>

                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags} />
                </div>

                {/*    Right Side - Booking Form */}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} people who have already booked their spot!
                            </p>
                        ) : (
                            <p className="text-sm">Be the first to book your spot!</p>
                        )}

                        <BookEvent eventId={event._id} slug={event.slug} />
                    </div>
                </aside>
            </div>

            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <Suspense fallback={<div className="opacity-70">Loading similar events...</div>}>
                    {/* This isolates the uncached DB access inside a Suspense boundary */}
                    <SimilarEvents slug={slug} />
                </Suspense>
            </div>
        </section>
    )
}
export default EventDetails