import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import AlertAction, { type ResolutionValues } from "../components/AlertAction";
import StatusRing from "../components/StatusRing";
import { useAuthStore } from "../auth/auth";
import { formatEventDay, formatEventPhrase, formatEventTime } from "../data/formatTime";
import { usePatientEvent } from "../data/usePatients";
import type { Patient } from "../data/patientTypes";

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
    <p className="text-[16px] sm:text-[18px] text-primary">{title}</p>
    <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">{body}</p>
    {children}
  </div>
);

const buttonClass =
  "mt-1 cursor-pointer rounded-md border-[1.5px] border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white";
const cardClass = "rounded-xl border border-[#C6C6CD99] bg-white p-5";

const ResolveStatus = () => {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState("");

  const role = useAuthStore((state) => state.user?.role);
  const isHealthcareProfessional =
    (role ?? "").toLowerCase().replace(/[_\s-]+/g, " ") === "healthcare professional";

  // nothing is requested for users who aren't allowed on this page.
  const { event, isLoading, hasError, reload } = usePatientEvent(
    isHealthcareProfessional ? patient.id : undefined,
    eventId
  );

  const basePath = `/patient/${patient.id}`;
  const eventPath = `${basePath}/activity/${encodeURIComponent(eventId ?? "")}`;

  if (!isHealthcareProfessional) {
    return (
      <StateCard
        title="Only healthcare professionals can resolve events"
        body="Your account has read-only access. You can still review this event and the patient's monitoring."
      >
        <Link to={eventPath} className={buttonClass}>
          Back to Event details
        </Link>
      </StateCard>
    );
  }

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

  const handleResolve = async ({ reason, notes }: ResolutionValues) => {
    // TODO: replace this simulated request with the resolve-event endpoint.
    await new Promise((resolve) => setTimeout(resolve, 600));

    sessionStorage.setItem(
      `resolution:${patient.id}:${event.id}`,
      JSON.stringify({ reason, notes })
    );
    navigate(`${eventPath}/resolved`);
  };

  const saveNote = () => {
    // TODO: send the note to the backend once an endpoint exists.
    toast.success("Note saved");
    setNote("");
  };

  const durationRow = event.type === "INACTIVITY_DETECTION";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[20px] sm:text-[22px] lg:text-[24px] text-primary">
          Resolve status
        </h1>
        <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-[#ECFDF3] px-3 py-1 text-[12px] font-medium text-[#15803D]">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[#22C55E]" />
          Ready to resolve
        </span>
      </div>

      <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">
        Confirm the outcome for the {event.label} event recorded {formatEventPhrase(event.timestamp)}.
        Keep the patient record accurate by documenting the resolution without adding invented
        contact or medical findings.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <AlertAction
          event={event}
          patient={patient}
          recordedPhrase={formatEventPhrase(event.timestamp)}
          draftKey={`draft:${patient.id}:${event.id}`}
          onResolve={handleResolve}
        />

        <div className="flex flex-col gap-4">
          <section className={cardClass}>
            <h2 className="text-[16px] sm:text-[18px] text-primary">Related event</h2>

            <div className="mt-4 flex items-center gap-3 rounded-lg bg-[#FEF9DD] p-3">
              <StatusRing level={event.level} thick />
              <p className="text-[13px] sm:text-[14px] text-primary">{event.label}</p>
            </div>

            <dl className="mt-3 divide-y divide-[#C6C6CD99]">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[12px] sm:text-[13px] text-[#6B7C93]">Recorded at</dt>
                <dd className="text-[12px] sm:text-[13px] text-primary">
                  {formatEventDay(event.timestamp)} · {formatEventTime(event.timestamp)}
                </dd>
              </div>
              {durationRow && (
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[12px] sm:text-[13px] text-[#6B7C93]">Inactivity duration</dt>
                  <dd className="text-[12px] sm:text-[13px] text-primary">
                    Not provided
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
              This event alone does not confirm a medical concern.
            </p>

            <Link
              to={basePath}
              className="mt-3 block w-full rounded-lg border border-[#2563EB] bg-white py-2.5 text-center text-[13px] sm:text-[14px] font-medium text-[#2563EB]"
            >
              View monitoring
            </Link>
          </section>

          {isHealthcareProfessional && (
            <section className={cardClass}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[14px] sm:text-[18px] text-primary">Add a note</h2>
                <span className="text-[11px] sm:text-[12px] text-[#6B7C93]">Optional</span>
              </div>
              <p className="mt-2 text-[12px] sm:text-[13px] text-[#6B7C93]">
                Record your observations or next steps after reviewing this event.
              </p>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a follow-up note..."
                aria-label="Follow-up note"
                className="mt-3 w-full rounded-lg border border-[#C6C6CD] bg-white px-3 py-2 text-[12px] sm:text-[13px] text-primary outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
              />
              <button
                type="button"
                onClick={saveNote}
                disabled={!note.trim()}
                className="mt-3 w-full cursor-pointer rounded-lg bg-[#2563EB] py-2.5 text-[13px] sm:text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#9CA3AF]"
              >
                Save note
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResolveStatus;