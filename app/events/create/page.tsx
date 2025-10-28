import CreateEventForm from "@/components/CreateEventForm";

const CreateEventPage = () => {
  return (
    <section className="space-y-6 mx-auto">
      <div className="text-center space-y-1">
        <h1>Create a new Event</h1>
        <p className="opacity-80">Fill out the form below to publish your event.</p>
      </div>
      <CreateEventForm />
    </section>
  );
};

export default CreateEventPage;
