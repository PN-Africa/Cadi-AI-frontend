import type { ReactNode } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { LucideClock } from "lucide-react";
import Loading from "../components/Loading";
import SummaryCards from "../components/SummaryCards";
import { useAuthStore } from "../auth/auth";
import { formatEventDay, formatEventTime } from "../data/formatTime";
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
    <p className="font-semibold text-[16px] sm:text-[18px] text-primary">{title}</p>
    <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">{body}</p>
    {children}
  </div>
);

const buttonClass =
  "mt-1 cursor-pointer rounded-md border-[1.5px] border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white";

const ActivityDetails = () => {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const { eventId } = useParams<{ eventId: string }>();
  const { event, isLoading, hasError, reload } = usePatientEvent(patient.id, eventId);

  const role = useAuthStore((state) => state.user?.role);
  const isHealthcareProfessional =
    (role ?? "").toLowerCase().replace(/[_\s-]+/g, " ") === "healthcare professional";

  const basePath = `/patient/${patient.id}`;

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

  const eventPath = `${basePath}/activity/${encodeURIComponent(event.id)}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[20px] sm:text-[22px] lg:text-[24px] text-primary">
          {event.label}
        </h1>
        <p className="flex items-center gap-2 text-[13px] sm:text-[14px] text-primary">
          <LucideClock className="size-4" aria-hidden="true" />
          {formatEventDay(event.timestamp)} · {formatEventTime(event.timestamp)}
        </p>
      </div>

      <SummaryCards
        event={event}
        patient={patient}
        canResolve={isHealthcareProfessional}
        resolveTo={`${eventPath}/resolve`}
        monitoringTo={basePath}
      />
    </div>
  );
};

export default ActivityDetails;