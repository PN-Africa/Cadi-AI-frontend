import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { usePatient } from "../data/usePatients";

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `justify-self-center rounded-md border-b-2 px-4 py-1.5 text-[13px] sm:text-[14px] font-medium ${
    isActive
      ? "border-[#1D4ED8] bg-[#BFDBFE] text-[#1D4ED8]"
      : "border-transparent text-primary hover:bg-white"
  }`;

const MessageCard = ({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) => (
  <div className="p-4 sm:p-6 lg:p-8">
    <div
      role="alert"
      className="rounded-xl border border-[#C6C6CD99] bg-white p-8 sm:p-10 flex flex-col items-center text-center gap-3"
    >
      <p className="font-semibold text-[16px] sm:text-[18px] text-primary">{title}</p>
      <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">{body}</p>
      {children}
    </div>
  </div>
);

const primaryButton =
  "mt-1 cursor-pointer rounded-lg border-[1.5px] border-[#1F3A5F] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white";

const Patient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patient, isLoading, isNotFound, hasError, reload } = usePatient(id);

  if (isLoading) {
    return <Loading variant="spinner" label="Loading patient" />;
  }

  if (hasError) {
    return (
      <MessageCard
        title="We couldn't load this patient"
        body="Check your connection, then try again."
      >
        <button type="button" onClick={reload} className={primaryButton}>
          Try Again
        </button>
      </MessageCard>
    );
  }

  if (isNotFound || !patient) {
    return (
      <MessageCard
        title="We couldn't find that patient"
        body="The patient ID in this link doesn't match anyone you're monitoring. Check the link or head back to your patient list."
      >
        <Link to="/patients" className={primaryButton}>
          Back to Patients
        </Link>
      </MessageCard>
    );
  }

  const details = [`ID • ${patient.patientCode}`, patient.age !== null ? `Age ${patient.age}` : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <header className="flex flex-col gap-3">

        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-11 sm:size-20 shrink-0 items-center justify-center rounded-full bg-[#1F3A5F] text-[14px] sm:text-[18px] text-white"
            >
              {getInitials(patient.name)}
            </div>

            <div className="min-w-0">
              <h1 className="truncate font-semibold text-[18px] sm:text-[24px] lg:text-[28px] text-primary">
                {patient.name}
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">{details}</p>
            </div>
          </div>

          <StatusBadge status={patient.status} className="shrink-0" />
        </div>
      </header>

      <nav aria-label="Patient sections" className="grid grid-cols-2">
        <NavLink to={`/patient/${patient.id}`} end className={tabClass}>
          Monitoring
        </NavLink>
        <NavLink to={`/patient/${patient.id}/activity`} className={tabClass}>
          Activity
        </NavLink>
      </nav>

      <Outlet context={{ patient }} />
    </div>
  );
};

export default Patient;