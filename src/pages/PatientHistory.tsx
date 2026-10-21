import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { LucideArrowUpDown, LucideChevronDown } from "lucide-react";
import type { Patient } from "../data/patientTypes";

type HistoryDay = "today" | "yesterday";
type HistoryStatus = "resolved" | "open";
type RangeFilter = "today" | "yesterday" | "week";
type StatusFilter = "all" | HistoryStatus;

interface HistoryRecord {
  id: string;
  eventId: string;
  day: HistoryDay;
  order: number;
  time: string;
  title: string;
  category: string;
  status: HistoryStatus;
  fields: { label: string; value: string }[];
}

// Mock history, used until the history endpoint exists. eventId points at the
// mock events in usePatients.ts so "View event details" opens a real page.
const mockHistory: HistoryRecord[] = [
  {
    id: "h1", eventId: "mock-inactivity", day: "today", order: 609, time: "10:09 AM",
    title: "Inactivity Detected", category: "Activity alert", status: "resolved",
    fields: [
      { label: "Inactivity duration", value: "15 minutes" },
      { label: "Resolution reason", value: "Patient checked and active" },
      { label: "Resolution notes", value: "Patient was sleeping, so was on his side for long" },
    ],
  },
  {
    id: "h2", eventId: "mock-fall-risk", day: "today", order: 582, time: "09:42 AM",
    title: "Fall Risk Alert", category: "Safety alert", status: "open",
    fields: [
      { label: "Alert source", value: "Bed sensor" },
      { label: "Last checked", value: "09:45 AM" },
      { label: "Notes", value: "Caregiver requested follow-up after the patient stood up quickly." },
    ],
  },
  {
    id: "h3", eventId: "mock-movement-4", day: "today", order: 500, time: "08:20 AM",
    title: "Movement Detected", category: "Activity alert", status: "resolved",
    fields: [
      { label: "Source", value: "Wearable sensor" },
      { label: "Resolution reason", value: "Routine activity confirmed" },
      { label: "Resolution notes", value: "No further action noted." },
    ],
  },
  {
    id: "h4", eventId: "mock-yesterday-1", day: "yesterday", order: -373, time: "05:47 PM",
    title: "Sudden Movement", category: "Activity alert", status: "resolved",
    fields: [
      { label: "Source", value: "Wearable sensor" },
      { label: "Resolution reason", value: "Patient checked and active" },
      { label: "Resolution notes", value: "No further action noted." },
    ],
  },
  {
    id: "h5", eventId: "mock-yesterday-2", day: "yesterday", order: -570, time: "02:30 PM",
    title: "Movement Detected", category: "Activity alert", status: "resolved",
    fields: [
      { label: "Source", value: "Wearable sensor" },
      { label: "Resolution reason", value: "Routine activity confirmed" },
      { label: "Resolution notes", value: "No further action noted." },
    ],
  },
];

const statusPill: Record<HistoryStatus, { label: string; pill: string; dot: string }> = {
  resolved: { label: "Resolved", pill: "bg-[#ECFDF3] text-[#15803D]", dot: "bg-[#22C55E]" },
  open: { label: "Open", pill: "bg-[#FEF9C3] text-[#B45309]", dot: "bg-[#EAB308]" },
};

const selectClass =
  "cursor-pointer appearance-none rounded-lg border border-[#C6C6CD] bg-white py-1.5 pl-3 pr-8 text-[12px] sm:text-[13px] font-medium text-primary outline-none focus:border-[#2563EB]";

const PatientHistory = () => {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const [range, setRange] = useState<RangeFilter>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [newestFirst, setNewestFirst] = useState(true);

  const records = useMemo(
    () =>
      mockHistory
        .filter((record) => range === "week" || record.day === range)
        .filter((record) => statusFilter === "all" || record.status === statusFilter)
        .sort((a, b) => (newestFirst ? b.order - a.order : a.order - b.order)),
    [range, statusFilter, newestFirst]
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-bold text-[20px] sm:text-[24px] lg:text-[28px] text-primary">
          Patient History
        </h1>
        <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7C93]">
          Review {patient.name}&rsquo;s recorded history, including the latest activity event and
          its preserved details.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeFilter)}
            aria-label="Show history for"
            className={selectClass}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 days</option>
          </select>
          <LucideChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            aria-label="Filter by status"
            className={selectClass}
          >
            <option value="all">All statuses</option>
            <option value="resolved">Resolved</option>
            <option value="open">Open</option>
          </select>
          <LucideChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
        </div>

        <button
          type="button"
          onClick={() => setNewestFirst((value) => !value)}
          className="ml-auto flex cursor-pointer items-center gap-1.5 text-[12px] sm:text-[13px] text-[#6B7C93]"
        >
          <LucideArrowUpDown className="size-4" aria-hidden="true" />
          {newestFirst ? "Newest first" : "Oldest first"}
        </button>
      </div>

      <section className="rounded-xl border border-[#C6C6CD99] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-[#C6C6CD99] pb-4">
          <h2 className="font-bold text-[15px] sm:text-[16px] text-primary">History</h2>
          <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
            {records.length} {records.length === 1 ? "record" : "records"} shown
          </p>
        </div>

        {records.length === 0 ? (
          <p className="py-10 text-center text-[13px] sm:text-[14px] text-[#6B7C93]">
            No history records match these filters.
          </p>
        ) : (
          <ol className="mt-5">
            {records.map((record, index) => {
              const isLast = index === records.length - 1;
              const pill = statusPill[record.status];

              return (
                <li
                  key={record.id}
                  className="grid grid-cols-[3.5rem_0.75rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[4.5rem_1rem_minmax(0,1fr)]"
                >
                  <div>
                    <p className="text-[12px] font-semibold text-primary">{record.time}</p>
                    <p className="text-[10px] text-[#6B7C93]">Recorded</p>
                  </div>

                  <div className="relative flex justify-center">
                    <span
                      aria-hidden="true"
                      className="relative z-10 mt-1 size-2.5 rounded-full border-2 border-[#2563EB] bg-white"
                    />
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-1/2 top-4 w-px -translate-x-1/2 bg-[#C6C6CD]"
                      />
                    )}
                  </div>

                  <div
                    className={`rounded-xl border border-[#C6C6CD99] bg-white p-4 ${
                      isLast ? "" : "mb-6"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[13px] sm:text-[14px] font-semibold text-primary">
                          {record.title}
                        </h3>
                        <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">{record.category}</p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] sm:text-[12px] font-medium ${pill.pill}`}
                      >
                        <span aria-hidden="true" className={`size-1.5 rounded-full ${pill.dot}`} />
                        {pill.label}
                      </span>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {record.fields.map((field) => (
                        <div key={field.label}>
                          <dt className="text-[11px] sm:text-[12px] text-[#6B7C93]">{field.label}</dt>
                          <dd className="mt-1 text-[12px] sm:text-[13px] font-medium text-primary">
                            {field.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <Link
                      to={`/patient/${patient.id}/activity/${encodeURIComponent(record.eventId)}`}
                      className="mt-4 inline-block rounded-lg border border-[#2563EB] bg-white px-4 py-2 text-[12px] sm:text-[13px] font-medium text-[#2563EB]"
                    >
                      View event details
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
};

export default PatientHistory;