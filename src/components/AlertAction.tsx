import { useState } from "react";
import toast from "react-hot-toast";
import StatusRing from "./StatusRing";
import type { ActivityEvent, Patient, PatientStatus } from "../data/patientTypes";

export interface ResolutionValues {
  reason: string;
  notes: string;
}

interface AlertActionProps {
  event: ActivityEvent;
  patient: Patient;
  recordedPhrase: string;
  draftKey: string;
  onResolve: (values: ResolutionValues) => Promise<void>;
}

const bannerTone: Record<PatientStatus, string> = {
  normal: "bg-[#F0FDF4]",
  "needs attention": "bg-[#FEF9DD]",
  emergency: "bg-[#FEF2F2]",
};

const readDraft = (key: string): ResolutionValues => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? { reason: "", notes: "", ...JSON.parse(raw) } : { reason: "", notes: "" };
  } catch {
    return { reason: "", notes: "" };
  }
};

const fieldClass =
  "mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-[12px] sm:text-[13px] text-primary outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]";

const AlertAction = ({ event, patient, recordedPhrase, draftKey, onResolve }: AlertActionProps) => {
  const [reason, setReason] = useState(() => readDraft(draftKey).reason);
  const [notes, setNotes] = useState(() => readDraft(draftKey).notes);
  const [reasonError, setReasonError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasContent = reason.trim() !== "" || notes.trim() !== "";

  const saveDraft = () => {
    sessionStorage.setItem(draftKey, JSON.stringify({ reason, notes }));
    toast.success("Draft saved");
  };

  const handleResolve = async () => {
    if (!reason.trim()) {
      setReasonError("Enter a reason for closing this event.");
      return;
    }

    setReasonError("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await onResolve({ reason: reason.trim(), notes: notes.trim() });
      sessionStorage.removeItem(draftKey);
    } catch (error) {
      console.log(error);
      setSubmitError("We couldn't resolve this event. Check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#C6C6CD99] bg-white p-5 sm:p-6">
      <h2 className="font-bold text-[16px] sm:text-[18px] text-primary">Resolution details</h2>

      <div className={`mt-4 flex items-start gap-3 rounded-lg p-4 ${bannerTone[event.level]}`}>
        <StatusRing level={event.level} thick className="mt-0.5" />
        <div>
          <p className="text-[13px] sm:text-[14px] font-semibold text-primary">{event.label}</p>
          <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7C93]">
            Recorded {recordedPhrase} for {patient.name} (ID {patient.patientCode}
            {patient.age !== null ? `, Age ${patient.age}` : ""}).
          </p>
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleResolve();
        }}
      >
        <label htmlFor="resolution-reason" className="mt-5 block text-[12px] sm:text-[13px] font-medium text-primary">
          Resolution reason
        </label>
        <input
          id="resolution-reason"
          type="text"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (reasonError) setReasonError("");
          }}
          placeholder="Enter the reason for closing this event..."
          aria-invalid={reasonError !== ""}
          aria-describedby={reasonError ? "resolution-reason-error" : undefined}
          className={`${fieldClass} ${reasonError ? "border-red-500" : "border-[#C6C6CD]"}`}
        />
        {reasonError && (
          <p id="resolution-reason-error" className="mt-1 text-[11px] text-red-500">
            {reasonError}
          </p>
        )}

        <label htmlFor="resolution-notes" className="mt-4 block text-[12px] sm:text-[13px] font-medium text-primary">
          Resolution notes
        </label>
        <input
          id="resolution-notes"
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any supporting context or next steps..."
          className={`${fieldClass} border-[#C6C6CD]`}
        />

        {submitError && (
          <p role="alert" className="mt-4 rounded-lg bg-[#FEF2F2] px-3 py-2 text-[12px] sm:text-[13px] text-[#B91C1C]">
            {submitError}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-lg bg-[#2563EB] py-2.5 text-[13px] sm:text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Resolving..." : "Resolve event"}
          </button>
          <button
            type="button"
            onClick={saveDraft}
            disabled={!hasContent || isSubmitting}
            className="w-[30%] cursor-pointer rounded-lg bg-[#2563EB] py-2.5 text-[13px] sm:text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#9CA3AF]"
          >
            Save draft
          </button>
        </div>
      </form>

      <p className="mt-4 text-[11px] sm:text-[12px] text-[#6B7C93]">
        Resolving this event will close the current alert and keep the patient record up to date
        without implying successful contact or a specific medical outcome.
      </p>
    </section>
  );
};

export default AlertAction;