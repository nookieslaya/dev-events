"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import ExploreBtn from "@/components/ExploreBtn";

const modes = ["online", "offline", "hybrid"] as const;

type Mode = typeof modes[number];

const CreateEventForm: React.FC = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [overview, setOverview] = useState("");
  const [venue, setVenue] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState<Mode>("online");
  const [audience, setAudience] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [tags, setTags] = useState("");
  const [agendaText, setAgendaText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Honeypot field (should stay empty)
  const [company, setCompany] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageFile) {
      setError("Please select an image file.");
      return;
    }
    // Client-side image validation (mirror server rules)
    if (!imageFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      setError('Image too large. Max 5MB.');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("overview", overview);
      formData.append("venue", venue);
      formData.append("location", location);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("mode", mode);
      formData.append("audience", audience);
      formData.append("organizer", organizer);

      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(tagArray));

      const agendaArray = agendaText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      formData.append("agenda", JSON.stringify(agendaArray));

      // Honeypot value (should be empty)
      formData.append("company", company);

      formData.append("image", imageFile);

      const res = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let message = 'Failed to create event';
        try {
          const data = await res.json();
          message = data?.message || message;
        } catch {}
        if (res.status === 429) {
          setError(message);
          return;
        }
        throw new Error(message);
      }

      const data = await res.json();
      const slug = data?.event?.slug;

      if (slug) {
        router.push(`/events/${slug}`);
      } else {
        router.push("/events");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-2xl">
      {/* Honeypot field to trap bots - keep hidden */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Title</span>
          <input
            className="input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Conf 2025"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">Description</span>
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the event"
            required
            rows={3}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">Overview</span>
          <textarea
            className="textarea"
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="What attendees will learn or do"
            required
            rows={3}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Venue</span>
            <input
              className="input"
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Venue name"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium">Location</span>
            <input
              className="input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              required
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Date</span>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium">Time</span>
            <input
              className="input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium">Mode</span>
            <select
              className="input"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              required
            >
              {modes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Audience</span>
            <input
              className="input"
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. Beginners, Professionals"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-medium">Organizer</span>
            <input
              className="input"
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Organization or person"
              required
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="font-medium">Tags</span>
          <input
            className="input"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated, e.g. react, nextjs, graphql"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">Agenda</span>
          <textarea
            className="textarea"
            value={agendaText}
            onChange={(e) => setAgendaText(e.target.value)}
            placeholder={"One item per line\n09:00 Registration\n10:00 Keynote"}
            required
            rows={4}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium">Image</span>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            required
          />
        </label>
      </div>

      {error && (
        <p className="text-red-500 text-sm" role="alert">
          {error}
        </p>
      )}

      <ExploreBtn
        type="submit"
        href={null}
        disabled={submitting}
      >
        {submitting ? "Creating..." : "Create Event"}
      </ExploreBtn>
    </form>
  );
};

export default CreateEventForm;
