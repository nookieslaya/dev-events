import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {events} from "@/lib/constants";

const Home = () => {
    return (
        <section className="text-center">
            <h1>The Hub bla bla bla bla</h1>
            <p className="text-center mt-5">blsa bla b la lbla</p>
            <ExploreBtn />


            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>
                <ul className="events">
                    {
                        events.map((item) => (
                            <li key={item.title}>
                                <EventCard {...item} />
                            </li>
                        ))
                    }
                </ul>
            </div>
        </section>)
}
export default Home
