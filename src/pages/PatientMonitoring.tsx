import { useOutletContext } from "react-router-dom";
import { LucideActivity, LucideDroplet, LucideHeart, LucideThermometer } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import StatusRing from "../components/StatusRing";
import { formatMinutes, formatRelativeTime } from "../data/formatTime";
import { usePatientMonitoring } from "../data/usePatients";
import type { Patient, PatientStatId, PatientStatus } from "../data/patientTypes";

const statIcons: Record<PatientStatId, typeof LucideHeart> = {
  "heart-rate": LucideHeart,
  temperature: LucideThermometer,
  "blood-oxygen": LucideDroplet,
  movement: LucideActivity,
};

const statusCardTone: Record<PatientStatus, string> = {
  normal: "border-[#BBF7D0] bg-[#F0FDF4]",
  "needs attention": "border-[#FDE68A] bg-[#FEFCE8]",
  emergency: "border-[#FECACA] bg-[#FEF2F2]",
};

const PatientMonitoring = () => {
  const { patient } = useOutletContext<{ patient: Patient }>();

  const { monitoring } = usePatientMonitoring(patient.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_5fr] md:gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-[16px] sm:text-[18px] text-primary">Current Status</h2>
          <div
            className={`flex flex-1 flex-col items-start gap-4 rounded-xl border p-4 ${statusCardTone[patient.status]}`}
          >
            <StatusBadge status={patient.status} withRing />
            <p className="text-[12px] sm:text-[13px] text-primary">
              Last Updated {formatRelativeTime(patient.lastUpdated)}
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-[16px] sm:text-[18px] text-primary">Quick Stats</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {patient.stats.map((stat) => {
              const Icon = statIcons[stat.id];
              const detail =
                stat.id === "movement" && monitoring?.movementCalculation
                  ? monitoring.movementCalculation
                  : stat.detail;

              return (
                <li
                  key={stat.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#C6C6CD99] bg-white p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#C6C6CD99] bg-white">
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-primary">{stat.label}</p>
                      <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">{detail}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[12px] sm:text-[13px] font-bold text-primary">{stat.code}</p>
                    <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">{stat.value}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="flex w-full flex-col gap-3 md:w-3/4">
        <h2 className="font-bold text-[16px] sm:text-[18px] text-primary">Current Status</h2>
        <ul className="rounded-xl border border-[#C6C6CD99] bg-white">
          {patient.indicators.map((indicator) => (
            <li
              key={indicator.id}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4 border-b border-[#C6C6CD99] px-4 py-3 text-[13px] sm:text-[14px] text-primary last:border-b-0"
            >
              <span>{indicator.label}</span>
              <span>{formatMinutes(indicator.minutesAgo)}</span>
              <StatusRing level={indicator.level} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default PatientMonitoring;