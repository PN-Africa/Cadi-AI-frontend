import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LucideInfo } from "lucide-react";
import StatusRing from "./StatusRing";
import { formatEventDay, formatEventTime } from "../data/formatTime";
import type { ActivityEvent, Patient, PatientStatus } from "../data/patientTypes";

interface SummaryCardsProps {
  event: ActivityEvent;
  patient: Patient;
  canResolve: boolean;
  resolveTo: string;
  monitoringTo: string;
}

const bannerTone: Record<PatientStatus, string> = {
  normal: "bg-[#F0FDF4]",
  "needs attention": "bg-[#FEF9DD]",
  emergency: "bg-[#FEF2F2]",
};

const cardClass = "rounded-xl border border-[#C6C6CD99] bg-white p-5";
const primaryLink =
  "block w-full rounded-lg bg-[#2563EB] py-2.5 text-center text-[13px] sm:text-[14px] text-white";
const outlineLink =
  "block w-full rounded-lg border border-[#2563EB] bg-white py-2.5 text-center text-[13px] sm:text-[14px] text-[#2563EB]";

const SummaryCards = ({ event, patient, canResolve, resolveTo, monitoringTo }: SummaryCardsProps) => {
  const [note, setNote] = useState("");

  const time = formatEventTime(event.timestamp);
  const noun = event.label.replace(/\s+(Detected|Detection)$/i, "");
  const isFlagged = event.level !== "normal";
  const article = /^[aeiou]/i.test(noun) ? "An" : "A";
  const firstName = patient.name.split(/\s+/)[0];

  const rows = [
    { label: "Recorded at", value: `${formatEventDay(event.timestamp)}, ${time}` },
    ...(event.type === "INACTIVITY_DETECTION"
      ? [{ label: "Inactivity duration", value: "Not provided" }]
      : []),
    { label: "Source", value: "Activity Timeline" },
  ];

  const saveNote = () => {
    toast.success("Note saved");
    setNote("");
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className={cardClass}>
        <h2 className="text-[16px] sm:text-[22px] text-primary">Event overview</h2>

        <div className={`mt-4 flex items-start gap-3 rounded-lg p-4 ${bannerTone[event.level]}`}>
          <StatusRing level={event.level} thick className="mt-0.5" />
          <div>
            <p className="text-[13px] sm:text-[14px] font-semibold text-primary">
              {isFlagged ? `${noun} flagged for review` : `${event.label} recorded`}
            </p>
            <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7C93]">
              {isFlagged
                ? `${article} ${noun.toLowerCase()} event was recorded for ${patient.name} at ${time}. Review the available context before deciding on follow-up.`
                : `${event.label} was recorded for ${patient.name} at ${time}.`}
            </p>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-[#C6C6CD99]">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-[12px] sm:text-[13px] text-[#6B7C93]">{row.label}</dt>
              <dd className="text-right text-[12px] sm:text-[13px] text-primary">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 flex items-start gap-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
          <LucideInfo className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          This event alone does not confirm a medical concern. Check monitoring and check the
          patient if needed.
        </p>
      </section>

      <div className="flex flex-col gap-4">
        <section className={cardClass}>
          <h2 className="text-[16px] sm:text-[18px] text-primary">Follow-up</h2>
          <p className="mt-2 text-[12px] sm:text-[13px] text-[#6B7C93]">
            Check in with {firstName} or review monitoring to decide what to do next.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {canResolve && (
              <Link to={resolveTo} className={primaryLink}>
                 Resolve Status
              </Link>
            )}
            <Link to={monitoringTo} className={outlineLink}>
              View monitoring
            </Link>
          </div>
        </section>

        {canResolve && (
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
              className="mt-3 w-full cursor-pointer rounded-lg bg-[#2563EB] py-2.5 text-[13px] sm:text-[14px] text-white disabled:cursor-not-allowed disabled:bg-[#F1F5F9] disabled:text-[#9CA3AF]"
            >
              Save note
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;