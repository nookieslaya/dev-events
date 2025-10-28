import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventsPage = async () => {
  'use cache';
  cacheLife('minutes');
  const response = await fetch(`${BASE_URL ? BASE_URL : ''}/api/events`);
  const { events } = await response.json();

  return (
    <section className="space-y-7">
      <div className="text-center">
        <h1>All Events</h1>
        <p className="mt-2">Browse all upcoming events</p>
      </div>

      <ul className="events">
        {events && events.length > 0 && events.map((event: IEvent) => (
          <li key={event.title} className="list-none">
            <EventCard {...event} />
          </li>
        ))}
        {(!events || events.length === 0) && (
          <li className="list-none w-full text-center opacity-70">No events found.</li>
        )}
      </ul>
    </section>
  );
};

export default EventsPage;
