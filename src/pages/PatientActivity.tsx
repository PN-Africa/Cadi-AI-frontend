import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { LucideChevronDown } from "lucide-react";
import Loading from "../components/Loading";
import StatusRing from "../components/StatusRing";
import { formatEventTime } from "../data/formatTime";
import { usePatientActivity } from "../data/usePatients";
import type { Patient } from "../data/patientTypes";

type ActivityRange = "today" | "yesterday" | "week";

const rangeOptions: { value: ActivityRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 days" },
];

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isWithinRange = (iso: string, range: ActivityRange, now: Date) => {
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return false;

  const todayStart = startOfDay(now);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - 6);

  if (range === "today") return when >= todayStart;
  if (range === "yesterday") return when >= yesterdayStart && when < todayStart;
  return when >= weekStart;
};

const PatientActivity = () => {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const { events, isLoading, hasError, reload } = usePatientActivity(patient.id);
  const [range, setRange] = useState<ActivityRange>("today");

  const visibleEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => isWithinRange(event.timestamp, range, now));
  }, [events, range]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] sm:text-[20px] lg:text-[24px] text-primary">
          Activity Timeline
        </h2>

        <div className="relative">
          <select
            value={range}
            onChange={(event) => setRange(event.target.value as ActivityRange)}
            aria-label="Show activity for"
            className="cursor-pointer appearance-none rounded-lg border border-[#6B7C93] bg-white py-1.5 pl-3 pr-9 text-[12px] sm:text-[14px] text-primary outline-none focus:border-[#1D4ED8]"
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <LucideChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-primary"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#C6C6CD99] bg-white px-4 pb-6 pt-2 sm:px-6">
        {isLoading ? (
          <Loading variant="table" rows={6} label="Loading activity" />
        ) : hasError ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="font-semibold text-[15px] sm:text-[16px] text-primary">
              We couldn't load this activity
            </p>
            <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">
              Check your connection, then try again.
            </p>
            <button
              type="button"
              onClick={reload}
              className="cursor-pointer rounded-md border-[1.5px] border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-[13px] sm:text-[14px] text-white"
            >
              Try Again
            </button>
          </div>
        ) : visibleEvents.length === 0 ? (
          <p className="py-10 text-center text-[13px] sm:text-[14px] text-[#6B7C93]">
            No activity recorded for this period.
          </p>
        ) : (
          <ol aria-label="Activity timeline">
            {visibleEvents.map((event, index) => (
              <li key={event.id} className="relative grid grid-cols-[minmax(0,1fr)_1.5rem] gap-x-3">
                <div className="grid grid-cols-2 gap-3 border-b border-[#C6C6CD99] py-4 text-[12px] sm:text-[13px] text-primary">
                  <Link
                    to={`/patient/${patient.id}/activity/${encodeURIComponent(event.id)}`}
                    title={event.description || undefined}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {event.label}
                  </Link>
                  <span>{formatEventTime(event.timestamp, range !== "today")}</span>
                </div>

                <div className="relative flex items-center justify-center">
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 w-px -translate-x-1/2 bg-[#C6C6CD] ${
                      index === 0 ? "top-1/2" : "top-0"
                    } ${index === visibleEvents.length - 1 ? "bottom-1/2" : "bottom-0"}`}
                  />
                  <StatusRing level={event.level} thick className="relative" />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};

export default PatientActivity;