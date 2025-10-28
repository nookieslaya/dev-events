import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { cacheLife } from "next/cache";
import { getBaseUrl } from "@/lib/getBaseUrl";

const BASE_URL = getBaseUrl();

const EventsPage = async () => {
  'use cache';
  cacheLife('minutes');
  const response = await fetch(`${BASE_URL}/api/events`);
  let events: IEvent[] = [];
  try {
    if (response.ok) {
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await response.json();
        events = Array.isArray((data as any)?.events) ? (data as any).events : [];
      }
    }
  } catch (err) {
    // Ignore JSON parse/network errors during prerender; fall back to empty list
  }

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
