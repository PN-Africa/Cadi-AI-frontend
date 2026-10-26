import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { LucideArrowUpDown, LucideChevronDown } from "lucide-react";
import Loading from "../components/Loading";
import { usePatientHistory } from "../data/usePatients";
import type { HistoryStatus, Patient } from "../data/patientTypes";

type RangeFilter = "today" | "yesterday" | "week";
type StatusFilter = "all" | HistoryStatus;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isInRange = (timestamp: number | null, range: RangeFilter, now: Date) => {
  if (timestamp === null) return range === "week";

  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - 6);

  if (range === "today") return timestamp >= todayStart.getTime();
  if (range === "yesterday")
    return timestamp >= yesterdayStart.getTime() && timestamp < todayStart.getTime();
  return timestamp >= weekStart.getTime();
};

const statusPill: Record<HistoryStatus, { label: string; pill: string; dot: string }> = {
  resolved: { label: "Resolved", pill: "bg-[#ECFDF3] text-[#15803D]", dot: "bg-[#22C55E]" },
  open: { label: "Open", pill: "bg-[#FEF9C3] text-[#B45309]", dot: "bg-[#EAB308]" },
};

const selectClass =
  "cursor-pointer appearance-none rounded-lg border border-[#C6C6CD] bg-white py-1.5 pl-3 pr-8 text-[12px] sm:text-[13px] text-primary outline-none focus:border-[#2563EB]";

const PatientHistory = () => {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const [range, setRange] = useState<RangeFilter>("today");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [newestFirst, setNewestFirst] = useState(true);

  const { records: allRecords, isLoading, hasError, reload } = usePatientHistory(patient.id);

  const records = useMemo(() => {
    const now = new Date();
    return allRecords
      .filter((record) => isInRange(record.timestamp, range, now))
      .filter((record) => statusFilter === "all" || record.status === statusFilter)
      .sort((a, b) =>
        newestFirst
          ? (b.timestamp ?? 0) - (a.timestamp ?? 0)
          : (a.timestamp ?? 0) - (b.timestamp ?? 0)
      );
  }, [allRecords, range, statusFilter, newestFirst]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] text-primary">
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
          <h2 className="text-[15px] sm:text-[16px] text-primary">History</h2>
          <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
            {records.length} {records.length === 1 ? "record" : "records"} shown
          </p>
        </div>

        {isLoading ? (
          <Loading variant="table" rows={4} label="Loading history" />
        ) : hasError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="font-semibold text-[15px] sm:text-[16px] text-primary">
              We couldn't load this history
            </p>
            <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">
              Check your connection, then try again.
            </p>
            <button
              type="button"
              onClick={reload}
              className="cursor-pointer rounded-md border-[1.5px] border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white"
            >
              Try Again
            </button>
          </div>
        ) : records.length === 0 ? (
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
                    <p className="text-[12px] text-primary">{record.time}</p>
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
                        <h3 className="text-[13px] sm:text-[14px] text-primary">
                          {record.title}
                        </h3>
                        <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">{record.category}</p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] sm:text-[12px] ${pill.pill}`}
                      >
                        <span aria-hidden="true" className={`size-1.5 rounded-full ${pill.dot}`} />
                        {pill.label}
                      </span>
                    </div>

                    <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {record.fields.map((field) => (
                        <div key={field.label}>
                          <dt className="text-[11px] sm:text-[12px] text-[#6B7C93]">{field.label}</dt>
                          <dd className="mt-1 text-[12px] sm:text-[13px] text-primary">
                            {field.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <Link
                      to={`/patient/${patient.id}/activity/${encodeURIComponent(record.eventId)}`}
                      className="mt-4 inline-block rounded-lg border border-[#2563EB] bg-white px-4 py-2 text-[12px] sm:text-[13px] text-[#2563EB]"
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