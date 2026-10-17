import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { LucideChevronDown } from "lucide-react";
import StatusRing from "../components/StatusRing";
import type { ActivityDay, Patient } from "../services/patientTypes";

const dayOptions: { value: ActivityDay; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
];

const PatientActivity = () => {
  const { patient } = useOutletContext<{ patient: Patient }>();
  const [day, setDay] = useState<ActivityDay>("today");

  const events = patient.activity.filter((event) => event.day === day);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-[18px] sm:text-[20px] lg:text-[24px] text-primary">
          Activity Timeline
        </h2>

        <div className="relative">
          <select
            value={day}
            onChange={(event) => setDay(event.target.value as ActivityDay)}
            aria-label="Show activity for"
            className="cursor-pointer appearance-none rounded-lg border border-[#6B7C93] bg-white py-1.5 pl-3 pr-9 text-[12px] sm:text-[13px] text-primary outline-none focus:border-[#1D4ED8]"
          >
            {dayOptions.map((option) => (
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
        {events.length === 0 ? (
          <p className="py-10 text-center text-[13px] sm:text-[14px] text-[#6B7C93]">
            No activity recorded for this period.
          </p>
        ) : (
          <ol aria-label="Activity timeline">
            {events.map((event, index) => (
              <li key={event.id} className="grid grid-cols-[minmax(0,1fr)_1.5rem] gap-x-3">
                <div className="grid grid-cols-2 gap-3 border-b border-[#C6C6CD99] py-4 text-[13px] sm:text-[14px] text-primary">
                  <span>{event.label}</span>
                  <span>{event.time}</span>
                </div>

                <div className="relative flex items-center justify-center">
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 w-px -translate-x-1/2 bg-[#C6C6CD] ${
                      index === 0 ? "top-1/2" : "top-0"
                    } ${index === events.length - 1 ? "bottom-1/2" : "bottom-0"}`}
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