import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { LucideCheck } from "lucide-react";
import Loading from "../components/Loading";
import { formatEventDay, formatEventTime } from "../data/formatTime";
import { usePatientEvent } from "../data/usePatients";
import type { Patient } from "../data/patientTypes";

interface Resolution {
  reason: string;
  notes: string;
}

const readResolution = (key: string): Resolution | null => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { reason: parsed.reason ?? "", notes: parsed.notes ?? "" };
  } catch {
    return null;
  }
};

const StateCard = ({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) => (
  <div
    role="alert"
    className="flex flex-col items-center gap-3 rounded-xl border border-[#C6C6CD99] bg-white p-8 text-center sm:p-10"
  >
    <p className="font-medium text-[16px] sm:text-[20px] text-primary">{title}</p>
    <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">{body}</p>
    {children}
  </div>
);

const buttonClass =
  "mt-1 cursor-pointer rounded-md border-[1.5px] border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white";
const cardClass = "rounded-xl border border-[#C6C6CD99] bg-white p-5 sm:p-6";

const EventResolved = () => {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const { eventId } = useParams<{ eventId: string }>();
  const { event, isLoading, hasError, reload } = usePatientEvent(patient.id, eventId);

  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    const openTimer = window.setTimeout(() => setIsBannerOpen(true), 50);
    const closeTimer = window.setTimeout(() => setIsBannerOpen(false), 4500);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
    };
  }, []);

  const basePath = `/patient/${patient.id}`;
  const eventPath = `${basePath}/activity/${encodeURIComponent(eventId ?? "")}`;

  if (isLoading) {
    return <Loading variant="spinner" label="Loading event" />;
  }

  if (hasError) {
    return (
      <StateCard
        title="We couldn't load this event"
        body="Check your connection, then try again."
      >
        <button type="button" onClick={reload} className={buttonClass}>
          Try Again
        </button>
      </StateCard>
    );
  }

  if (!event) {
    return (
      <StateCard
        title="We couldn't find that event"
        body="This event may have been removed, or the link may be out of date."
      >
        <Link to={`${basePath}/activity`} className={buttonClass}>
          Back to Activity Timeline
        </Link>
      </StateCard>
    );
  }

  // The backend says whether the event is resolved; it doesn't return the reason/notes,
  // so those come from what was submitted in this session (blank -> "Not provided").
  const resolution = event.isResolved
    ? readResolution(`resolution:${patient.id}:${event.id}`) ?? { reason: "", notes: "" }
    : null;

  if (!resolution) {
    return (
      <StateCard
        title="This event hasn't been resolved"
        body="There's no resolution recorded for this event yet."
      >
        <Link to={eventPath} className={buttonClass}>
          Back to Event details
        </Link>
      </StateCard>
    );
  }

  const recordedAt = `${formatEventDay(event.timestamp)} · ${formatEventTime(event.timestamp)}`;
  const showDuration = event.type === "INACTIVITY_DETECTION";

  return (
    <div className="flex flex-col">
      <h1 className="text-[20px] sm:text-[22px] lg:text-[24px] text-primary">
        Event resolved
      </h1>
      <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7C93]">
        {event.label} · {recordedAt}
      </p>

      <div
        aria-live="polite"
        className={`grid transition-all duration-500 ease-out motion-reduce:transition-none ${
          isBannerOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#ECFDF3] p-4">
            <LucideCheck className="size-8 shrink-0 text-[#22C55E]" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-[13px] sm:text-[14px] text-primary">
                Current alert closed
              </p>
              <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">
                This event is resolved. {patient.name}&rsquo;s patient record has been updated.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className={cardClass}>
          <h2 className="text-[16px] sm:text-[22px] text-primary">Event summary</h2>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-[13px] sm:text-[16px] font-medium text-primary">{event.label}</p>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ECFDF3] px-2.5 py-1 text-[11px] sm:text-[12px] font-medium text-[#15803D]">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#22C55E]" />
              Resolved
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] sm:text-[12px] text-[#6B7C93]">Recorded at</dt>
              <dd className="mt-1 text-[12px] sm:text-[16px] font-medium text-primary">{recordedAt}</dd>
            </div>
            {showDuration && (
              <div>
                <dt className="text-[11px] sm:text-[12px] text-[#6B7C93]">Inactivity duration</dt>
                <dd className="mt-1 text-[12px] sm:text-[16px] font-medium text-primary">
                  {event.inactivityDuration || "Not provided"}
                </dd>
              </div>
            )}
          </dl>

          <div className="my-4 border-t border-[#C6C6CD99]" />

          <h3 className="text-[13px] sm:text-[14px] text-primary">Resolution details</h3>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] sm:text-[12px] text-[#6B7C93]">Resolution reason</dt>
              <dd className="mt-1 text-[12px] sm:text-[16px] font-medium text-primary">
                {resolution.reason || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] sm:text-[12px] text-[#6B7C93]">Resolution notes</dt>
              <dd className="mt-1 text-[12px] sm:text-[16px] font-medium text-primary">
                {resolution.notes || "Not provided"}
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex flex-col gap-4">
          <section className={cardClass}>
            <h2 className="text-[16px] sm:text-[18px] text-primary">What&rsquo;s next?</h2>
            <p className="mt-2 text-[12px] sm:text-[13px] text-[#6B7C93]">
              Return to {patient.name}&rsquo;s activity or view current monitoring information.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                to={`${basePath}/history`}
                className="block w-full rounded-lg bg-[#2563EB] py-2.5 text-center text-[13px] sm:text-[14px] font-medium text-white"
              >
                View patient history
              </Link>
              <Link
                to={basePath}
                className="block w-full rounded-lg border border-[#2563EB] bg-white py-2.5 text-center text-[13px] sm:text-[14px] font-medium text-[#2563EB]"
              >
                View monitoring
              </Link>
            </div>
          </section>

          <section className="rounded-xl bg-[#F1F5F9] p-5">
            <h2 className="text-[13px] sm:text-[16px] text-primary">
              About this resolution
            </h2>
            <p className="mt-2 text-[12px] sm:text-[13px] text-[#6B7C93]">
              Only this event&rsquo;s alert is closed. This does not confirm the patient&rsquo;s
              medical status or close any other alerts.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EventResolved;