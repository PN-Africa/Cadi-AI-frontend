import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LucideArrowLeft,
  LucideChevronDown,
  LucideClipboardList,
  LucideFolder,
  LucidePhone,
} from "lucide-react";
import Loading from "../components/Loading";
import { useAuthStore } from "../auth/auth";
import { isAdminRole, isHealthcareRole } from "../auth/roles";
import { useProfileStore } from "../data/profile";
import { formatEventDay, formatEventTime } from "../data/formatTime";
import {
  usePatient,
  usePatientActivity,
  usePatientEvent,
  usePatients,
} from "../data/usePatients";
import { addEventNote, getErrorMessage, resolveEvent, toApiStatus } from "../services/apiPatients";
import type { EventDetail, Patient, PatientStatus, PatientSummary } from "../data/patientTypes";

const cardClass = "rounded-xl border border-[#C6C6CD99] bg-white p-5";
const headingClass = "text-[15px] sm:text-[18px] font-semibold text-primary";
const pillClass =
  "rounded-md border border-[#C6C6CD99] bg-[#F8F9FF] px-2 py-0.5 text-[10px] sm:text-[11px] text-[#6B7C93]";
const boxClass =
  "w-full rounded-lg border border-[#C6C6CD99] bg-[#F8F9FF] px-3 py-2.5 text-[12px] sm:text-[13px] text-primary outline-none focus:border-[#2563EB]";
const textareaClass =
  "w-full resize-none rounded-lg border border-[#C6C6CD99] bg-white px-3 py-2.5 text-[12px] sm:text-[13px] text-primary outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB] read-only:cursor-default";
const saveButtonClass =
  "cursor-pointer rounded-lg bg-[#2563EB] px-6 py-2.5 text-[13px] sm:text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60";

const priorityLabels: Record<PatientStatus, string> = {
  emergency: "Emergency",
  "needs attention": "Needs Attention",
  normal: "Normal",
};

const severity: Record<PatientStatus, number> = {
  emergency: 0,
  "needs attention": 1,
  normal: 2,
};

const resolutionStatuses = ["Closed", "Needs follow-up", "Escalated"];
const reviewOptions = ["Not scheduled", "In 1 hour", "In 4 hours", "Tomorrow", "In 1 week"];

const Row = ({
  label,
  htmlFor,
  narrow = false,
  top = false,
  children,
}: {
  label: string;
  htmlFor: string;
  narrow?: boolean;
  top?: boolean;
  children: ReactNode;
}) => (
  <div
    className={`grid gap-3 ${narrow ? "grid-cols-[4.5rem_minmax(0,1fr)]" : "grid-cols-[5.5rem_minmax(0,1fr)]"} ${
      top ? "items-start" : "items-center"
    }`}
  >
    <label htmlFor={htmlFor} className={`text-[12px] sm:text-[13px] text-primary ${top ? "pt-2.5" : ""}`}>
      {label}
    </label>
    {children}
  </div>
);

const SelectField = ({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) => (
  <div className="relative">
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${boxClass} cursor-pointer appearance-none pr-9`}
    >
      {children}
    </select>
    <LucideChevronDown
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7C93]"
      aria-hidden="true"
    />
  </div>
);

interface DraftEditorProps {
  patient: Patient;
  event: EventDetail | null;
  patients: PatientSummary[];
  onPatientChange: (id: string) => void;
}

const DraftEditor = ({ patient, event, patients, onPatientChange }: DraftEditorProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profileName = useProfileStore((state) => state.name);
  const isHealthcare = isHealthcareRole(user?.role);
  const caregiverName = profileName || user?.name?.trim() || user?.email || "";

  const [notes, setNotes] = useState(event?.caregiverNotes ?? "");
  const [savedNotes, setSavedNotes] = useState(event?.caregiverNotes ?? "");
  const [resolutionStatus, setResolutionStatus] = useState(resolutionStatuses[0]);
  const [resolutionNote, setResolutionNote] = useState("");
  const [nextReview, setNextReview] = useState(reviewOptions[0]);
  const [savedAt, setSavedAt] = useState(patient.lastUpdated);
  const [saving, setSaving] = useState<"draft" | "resolution" | null>(null);

  const needsAttentionCount = patients.filter((item) => item.status === "needs attention").length;
  const lastUpdated = Number.isNaN(new Date(savedAt).getTime())
    ? "Not saved yet"
    : `${formatEventDay(savedAt)}, ${formatEventTime(savedAt)}`;

  const buildResolutionNotes = () =>
    [resolutionNote.trim(), nextReview !== reviewOptions[0] ? `Next review: ${nextReview}` : ""]
      .filter(Boolean)
      .join("\n");

  const handleSaveDraft = async () => {
    if (saving) return;
    if (!event) {
      toast.error("This patient has no events to attach a draft to.");
      return;
    }

    const noteText = notes.trim();
    if (!isHealthcare && !noteText && !resolutionNote.trim()) {
      toast.error("Add a note or resolution note before saving your draft.");
      return;
    }

    setSaving("draft");
    try {
      if (!isHealthcare && noteText && noteText !== savedNotes.trim()) {
        await addEventNote(patient.id, event.id, noteText);
        setSavedNotes(noteText);
      }

      await resolveEvent( event.id, {
        resolutionReason: resolutionStatus,
        resolutionNotes: buildResolutionNotes(),
        updatedPatientStatus: toApiStatus(patient.status),
        isDraft: true,
      });

      setSavedAt(new Date().toISOString());
      toast.success("Draft saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't save your draft. Please try again."));
    } finally {
      setSaving(null);
    }
  };

  const handleSaveResolution = async () => {
    if (saving) return;
    if (!event) {
      toast.error("This patient has no events to resolve.");
      return;
    }
    if (!isHealthcare) {
      toast.error("Only healthcare professionals can save a resolution.");
      return;
    }
    if (!resolutionNote.trim()) {
      toast.error("Add a resolution note before saving.");
      return;
    }

    setSaving("resolution");
    try {
      const resolutionNotes = buildResolutionNotes();

      await resolveEvent( event.id, {
        resolutionReason: resolutionStatus,
        resolutionNotes,
        updatedPatientStatus: toApiStatus(patient.status),
        isDraft: false,
      });
      sessionStorage.setItem(
        `resolution:${patient.id}:${event.id}`,
        JSON.stringify({ reason: resolutionStatus, notes: resolutionNotes })
      );
      toast.success("Resolution saved");
      navigate(`/patient/${patient.id}/activity/${encodeURIComponent(event.id)}/resolved`);
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't save the resolution. Please try again."));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="flex items-start gap-3 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#2563EB]"
        >
          <LucideFolder className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] sm:text-[14px] font-semibold text-[#1D4ED8]">Draft</span>
            <span className="rounded-md border border-[#BFDBFE] bg-white px-2 py-0.5 text-[10px] sm:text-[11px] text-[#6B7C93]">
              Save draft or resolution
            </span>
          </p>
          <p className="mt-1 text-[12px] sm:text-[13px] text-primary">
            Use this draft page to capture caregiver notes, patient follow-up, and the resolution when the issue
            is closed.
          </p>
          <p className="mt-1 text-[11px] sm:text-[12px] text-[#6B7C93]">
            Saving a draft keeps your work in progress. Saving a resolution marks the follow-up as complete.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.9fr_1fr]">
        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={headingClass}>Draft details</h2>
            <span className={pillClass}>Draft</span>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <Row label="Patient" htmlFor="draftPatient">
              <SelectField id="draftPatient" value={patient.id} onChange={onPatientChange}>
                {patients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.display}
                  </option>
                ))}
              </SelectField>
            </Row>
            <Row label="Caregiver" htmlFor="draftCaregiver">
              <input id="draftCaregiver" type="text" readOnly value={caregiverName} className={boxClass} />
            </Row>
            <Row label="Priority" htmlFor="draftPriority">
              <input
                id="draftPriority"
                type="text"
                readOnly
                value={priorityLabels[patient.status]}
                className={boxClass}
              />
            </Row>
            <Row label="Last updated" htmlFor="draftUpdated">
              <input id="draftUpdated" type="text" readOnly value={lastUpdated} className={boxClass} />
            </Row>
            <Row label="Notes" htmlFor="draftNotes" top>
              <textarea
                id="draftNotes"
                rows={4}
                value={notes}
                readOnly={isHealthcare}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add caregiver notes..."
                className={textareaClass}
              />
            </Row>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={headingClass}>Resolution entry</h2>
            <span className={pillClass}>Optional</span>
          </div>
          <p className="mt-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
            Complete this section when the follow-up is finished. Saving a resolution marks the draft as
            complete.
          </p>

          <div className="mt-4 flex flex-col gap-4">
            <Row label="Resolution status" htmlFor="resolutionStatus" narrow>
              <SelectField id="resolutionStatus" value={resolutionStatus} onChange={setResolutionStatus}>
                {resolutionStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </SelectField>
            </Row>
            <Row label="Resolution note" htmlFor="resolutionNote" narrow top>
              <textarea
                id="resolutionNote"
                rows={5}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Describe the outcome..."
                className={textareaClass}
              />
            </Row>
            <Row label="Next review" htmlFor="nextReview" narrow>
              <SelectField id="nextReview" value={nextReview} onChange={setNextReview}>
                {reviewOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
            </Row>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={headingClass}>Attachments</h2>
            <span className="text-[10px] sm:text-[11px] text-[#6B7C93]">0 files</span>
          </div>
          <p className="mt-4 text-[12px] sm:text-[13px] text-[#6B7C93]">No attachments added yet.</p>
        </section>

        <section className={cardClass}>
          <h2 className={headingClass}>Your next steps</h2>

          <ul className="mt-4 flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <LucidePhone className="mt-0.5 size-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
              <div>
                <p className="text-[12px] sm:text-[13px] font-semibold text-primary">Review emergency flags</p>
                <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
                  Open each flagged patient to review their latest activity and arrange a check-in.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <LucideClipboardList className="mt-0.5 size-4 shrink-0 text-[#2563EB]" aria-hidden="true" />
              <div>
                <p className="text-[12px] sm:text-[13px] font-semibold text-primary">
                  Follow up on attention flags
                </p>
                <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
                  {needsAttentionCount === 0
                    ? "No patients are currently marked Needs Attention."
                    : `Review all ${needsAttentionCount} patient${needsAttentionCount === 1 ? "" : "s"} marked Needs Attention in the patient list.`}
                </p>
              </div>
            </li>
          </ul>

          <p className="mt-4 flex items-center gap-2 border-t border-[#C6C6CD99] pt-3 text-[10px] sm:text-[11px] text-[#6B7C93]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#2563EB]" />
            Assigned caregiver: {caregiverName || "Not assigned"}
          </p>
        </section>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
          Saving a draft keeps your work in progress. Saving a resolution marks the follow-up as complete.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={handleSaveDraft} disabled={saving !== null} className={saveButtonClass}>
            {saving === "draft" ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={handleSaveResolution}
            disabled={saving !== null}
            className={saveButtonClass}
          >
            {saving === "resolution" ? "Saving..." : "Save resolution"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StateCard = ({ title, body, children }: { title: string; body: string; children?: ReactNode }) => (
  <div
    role="alert"
    className="flex flex-col items-center gap-3 rounded-xl border border-[#C6C6CD99] bg-white p-8 text-center sm:p-10"
  >
    <p className="font-semibold text-[16px] sm:text-[18px] text-primary">{title}</p>
    <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">{body}</p>
    {children}
  </div>
);

const DraftsContent = () => {
  const [params, setParams] = useSearchParams();
  const { patients, isLoading: loadingPatients, hasError: patientsError, reload } = usePatients();

  const patientId = useMemo(() => {
    const requested = params.get("patient");
    if (requested && patients.some((item) => item.id === requested)) return requested;
    return [...patients].sort((a, b) => severity[a.status] - severity[b.status])[0]?.id;
  }, [params, patients]);

  const { patient, isLoading: loadingPatient, hasError: patientError, reload: reloadPatient } =
    usePatient(patientId);
  const { events, isLoading: loadingEvents } = usePatientActivity(patientId);

  const requestedEvent = params.get("event");
  const eventId =
    requestedEvent && events.some((item) => item.id === requestedEvent) ? requestedEvent : events[0]?.id;
  const { event, isLoading: loadingEvent } = usePatientEvent(patientId, eventId);

  const breadcrumb = (
    <p className="flex items-center gap-2 text-[12px] sm:text-[13px]">
      <Link to="/dashboard" className="flex items-center gap-1.5 text-[#2563EB]">
        <LucideArrowLeft className="size-4" aria-hidden="true" />
        Dashboard
      </Link>
      <span className="text-[#6B7C93]">/ Draft page</span>
    </p>
  );

  let body: ReactNode;

  if (loadingPatients || (patientId && (loadingPatient || loadingEvents || loadingEvent))) {
    body = <Loading variant="spinner" label="Loading draft" />;
  } else if (patientsError || patientError) {
    body = (
      <StateCard title="We couldn't load this draft" body="Check your connection, then try again.">
        <button
          type="button"
          onClick={patientsError ? reload : reloadPatient}
          className="mt-1 cursor-pointer rounded-md border-[1.5px] border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white"
        >
          Try Again
        </button>
      </StateCard>
    );
  } else if (!patient) {
    body = (
      <StateCard
        title="No patients to draft for yet"
        body="Patients assigned to you will appear here so you can save a draft or resolution."
      />
    );
  } else {
    body = (
      <DraftEditor
        key={`${patient.id}:${event?.id ?? "none"}`}
        patient={patient}
        event={event}
        patients={patients}
        onPatientChange={(id) => setParams({ patient: id })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">
      {breadcrumb}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-semibold text-primary">Draft</h1>
          <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7C93]">
            Save a draft of your work before you close this page, or save a resolution when the follow-up is
            complete.
          </p>
        </div>
      </div>

      {body}
    </div>
  );
};

const Drafts = () => {
  const role = useAuthStore((state) => state.user?.role);

  if (isAdminRole(role)) return <Navigate to="/dashboard" replace />;

  return <DraftsContent />;
};

export default Drafts;