import { Suspense, use } from "react";
import EventDetails from "@/components/EventDetails";

const EventDetailsInner = ({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) => {
    const { slug } = use(paramsPromise);
    return <EventDetails slug={slug} />;
};

const EventDetailsPage = ({ params }: { params: Promise<{ slug: string }> }) => {
    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <EventDetailsInner paramsPromise={params} />
            </Suspense>
        </main>
    );
};
export default EventDetailsPage