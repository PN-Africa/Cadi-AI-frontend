import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LucideActivity,
  LucideAlertTriangle,
  LucideClock,
  LucideRefreshCw,
  LucideSlidersHorizontal,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideUser,
} from "lucide-react";
import usericon from "../assets/profile-2user.svg"
import Loading from "../components/Loading";
import type { LayoutContext } from "../layout/Layout";
import {
  getDashboard,
  type DashboardData,
  type DashboardPatient,
  type DashboardMetrics,
  type DashboardStatusBreakdown,
  type DashboardPatientStatus,
} from "../services/apiDashboard";

type LoadStatus = "loading" | "error" | "success";

// Week-over-week change shown in the badge on each summary card. The badge only
// renders when the API sends the value (field names are a guess - see notes).
type MetricsWithTrends = DashboardMetrics & {
  totalPatientsChange?: number | null;
  needsAttentionChange?: number | null;
  emergencyAlertsChange?: number | null;
};

// Used until real numbers exist (e.g. no patients yet), so the cards and ring still render.
const emptyMetrics: DashboardMetrics = {
  totalPatientsMonitored: 0,
  totalPatientsNeedingAttention: 0,
  totalEmergencyAlerts: 0,
};
const emptyBreakdown: DashboardStatusBreakdown = {
  normal: 0,
  needsAttention: 0,
  emergency: 0,
};

const cardClass = "bg-white border border-[#C6C6CD99] rounded-2xl";

const statusStyles: Record<
  DashboardPatientStatus,
  { badge: string }
> = {
  Normal: { badge: "bg-[#BBF7D0] text-[#166534]" },
  "Needs Attention": { badge: "bg-[#FEF08A] text-[#854D0E]" },
  Emergency: { badge: "bg-[#FEE2E2] text-[#DC2626]" },
};

const StatusBadge = ({ status }: { status: DashboardPatientStatus }) => {
  const { badge } = statusStyles[status];

  return (
    <span
      className={`inline-flex min-w-[6.5rem] items-center justify-center rounded-md px-3 py-2 text-[12px] sm:min-w-[7.5rem] sm:text-[13px] font-medium ${badge}`}
    >
      {status}
    </span>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  iconColor: string;
  badgeClass: string;
  caption: string;
  change?: number | null;
}

const SummaryCard = ({ label, value, icon, iconColor, badgeClass, caption, change }: SummaryCardProps) => {
  const hasChange = typeof change === "number" && !Number.isNaN(change);
  const TrendIcon = hasChange && change < 0 ? LucideTrendingDown : LucideTrendingUp;

  return (
    <div className={`${cardClass} p-4 flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] sm:text-[13px] text-primary">{label}</p>
        <span className={`shrink-0 ${iconColor}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="text-[22px] sm:text-[26px] font-semibold leading-tight text-primary">{value}</p>
      <p className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-[12px] text-[#6B7C93]">
        {hasChange && (
          <>
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ${badgeClass}`}
            >
              <TrendIcon className="size-3" aria-hidden="true" />
              {Math.abs(change)}%
            </span>
            <span aria-hidden="true">&bull;</span>
          </>
        )}
        {caption}
      </p>
    </div>
  );
};

const StatusOverview = ({
  metrics,
  statusBreakdown,
  className = "",
}: {
  metrics: DashboardMetrics;
  statusBreakdown: DashboardStatusBreakdown;
  className?: string;
}) => {
  const segments = [
    { label: "Normal", value: statusBreakdown.normal, color: "#4ADE80" },
    { label: "Needs Attention", value: statusBreakdown.needsAttention, color: "#FDE047" },
    { label: "Emergency Alerts", value: statusBreakdown.emergency, color: "#F87171" },
  ];

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  let cumulative = 0;
  const arcs = segments.map((segment) => {
    const percent = total > 0 ? (segment.value / total) * 100 : 0;
    const arc = { ...segment, percent, offset: cumulative };
    cumulative += percent;
    return arc;
  });

  return (
    <section
      className={`${cardClass} p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-around gap-6 ${className}`}
    >
      <div>
        <h2 className="font-semibold text-[15px] sm:text-[17px] text-primary mb-4">
          Patients Status
        </h2>
        <ul className="flex flex-col gap-3">
          {segments.map((segment) => (
            <li
              key={segment.label}
              className="flex items-center gap-2.5 text-[13px] sm:text-[14px] text-primary"
            >
              <span
                className="size-3.5 rounded-full"
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              />
              {segment.label}
              <span className="sr-only">{segment.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="relative size-36 sm:size-40 mx-auto sm:mx-0"
        role="img"
        aria-label={`${metrics.totalPatientsMonitored} patients: ${statusBreakdown.normal} normal, ${statusBreakdown.needsAttention} need attention, ${statusBreakdown.emergency} emergency`}
      >
        <svg viewBox="0 0 36 36" className="size-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="14.5"
            pathLength={100}
            fill="none"
            stroke="#E4E8F0"
            strokeWidth="7"
          />
          {arcs.map(
            (arc) =>
              arc.percent > 0 && (
                <circle
                  key={arc.label}
                  cx="18"
                  cy="18"
                  r="14.5"
                  pathLength={100}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="7"
                  strokeDasharray={`${arc.percent} ${100 - arc.percent}`}
                  strokeDashoffset={-arc.offset}
                />
              )
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[22px] sm:text-[24px] font-semibold leading-tight text-primary">
            {metrics.totalPatientsMonitored}
          </p>
          <p className="text-[12px] sm:text-[13px] text-primary">Patients</p>
        </div>
      </div>
    </section>
  );
};

const weekdays = [
  { short: "S", full: "Sunday" },
  { short: "M", full: "Monday" },
  { short: "T", full: "Tuesday" },
  { short: "W", full: "Wednesday" },
  { short: "T", full: "Thursday" },
  { short: "F", full: "Friday" },
  { short: "S", full: "Saturday" },
];

const Calendar = ({ className = "" }: { className?: string }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  const title = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(today);

  return (
    <section className={`${cardClass} p-4 ${className}`}>
      <h2 className="font-semibold text-[15px] sm:text-[16px] text-primary mb-3">{title}</h2>

      <table className="w-full table-fixed text-center" aria-label={`${title} calendar`}>
        <thead>
          <tr>
            {weekdays.map((day) => (
              <th
                key={day.full}
                scope="col"
                abbr={day.full}
                className="pb-2 text-[11px] sm:text-[12px] font-semibold text-primary"
              >
                {day.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => {
                if (day === null) return <td key={dayIndex} className="py-1" />;

                const isToday = day === todayDate;
                const isPast = day < todayDate;

                return (
                  <td key={dayIndex} className="py-1">
                    <span
                      aria-current={isToday ? "date" : undefined}
                      className={`mx-auto flex size-6 items-center justify-center rounded text-[11px] sm:text-[12px] ${
                        isToday
                          ? "bg-[#2563EB] font-semibold text-white"
                          : isPast
                            ? "text-[#9CA3AF]"
                            : "font-semibold text-primary"
                      }`}
                    >
                      {day}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

const columns =
  "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_2rem]";

const PatientRow = ({ patient }: { patient: DashboardPatient }) => (
  <div
    role="row"
    className={`relative grid ${columns} items-center gap-x-3 gap-y-2 px-4 sm:px-6 py-4 hover:bg-[#F8F9FF]`}
  >
    <div role="cell" className="min-w-0 sm:col-start-1">
      <Link
        to={`/patient/${patient.id}`}
        className="text-[12px] sm:text-[13px] text-primary after:absolute after:inset-0 after:content-['']"
      >
        {patient.name} - {patient.id}
      </Link>
    </div>

    <div
      role="cell"
      aria-hidden="true"
      className="col-start-2 row-start-1 flex items-center gap-[3px] justify-self-end sm:col-start-4"
    >
      <span className="size-[3px] rounded-full bg-[#2563EB]" />
      <span className="size-[3px] rounded-full bg-[#2563EB]" />
      <span className="size-[3px] rounded-full bg-[#2563EB]" />
    </div>

    <div
      role="cell"
      className="col-start-1 row-start-2 text-[12px] sm:text-[13px] text-primary sm:col-start-2 sm:row-start-1 sm:text-center"
    >
      {patient.recentActivity}
    </div>

    <div
      role="cell"
      className="col-start-2 row-start-2 justify-self-end sm:col-start-3 sm:row-start-1 sm:justify-self-center"
    >
      <StatusBadge status={patient.status} />
    </div>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div
    role="alert"
    className="bg-white border border-[#C6C6CD99] rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center gap-3"
  >
    <div className="bg-[#FDECEC] rounded-2xl p-3">
      <LucideAlertTriangle className="size-6 text-[#8A1F1F]" />
    </div>
    <p className="font-semibold text-[16px] sm:text-[18px] text-primary">
      We couldn't load your dashboard
    </p>
    <p className="text-[13px] sm:text-[14px] text-[#6B7C93] max-w-md">
      Check your connection, then try again. If it keeps happening, contact your administrator.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="text-white bg-[#1D4ED8] cursor-pointer border-[1.5px] rounded-2xl border-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] flex items-center gap-2"
    >
      <LucideRefreshCw className="size-4" />
      Try Again
    </button>
  </div>
);

// Sits inside the patient list card, under the column headers.
const EmptyState = () => (
  <div className="px-6 py-10 sm:py-12 flex flex-col items-center text-center gap-3">
    <div className="bg-[#EEF3FC] rounded-2xl p-3">
      <img src={usericon} alt="" className="size-6 text-[#0D469C]" />
    </div>
    <p className="font-semibold text-[16px] sm:text-[18px] text-primary">
      No patients to show yet
    </p>
    <p className="text-[13px] sm:text-[14px] text-[#6B7C93] max-w-md">
      Patients assigned to you will appear here with their latest status and recent activity.
    </p>
  </div>
);

const Dashboard = () => {
  const { setNotifications } = useOutletContext<LayoutContext>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const requestId = useRef(0);

  const loadDashboard = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setStatus("loading");

    try {
      const result = await getDashboard();

      if (currentRequest !== requestId.current) return;

      setData(result);
      setNotifications([]);
      setStatus("success");
    } catch (error) {
      if (currentRequest !== requestId.current) return;

      console.error("Unable to load dashboard", error);
      toast.error("Unable to load dashboard. Please try again.");
      setStatus("error");
    }
  }, [setNotifications]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics: MetricsWithTrends = { ...emptyMetrics, ...data?.metrics };
  const statusBreakdown: DashboardStatusBreakdown = { ...emptyBreakdown, ...data?.statusBreakdown };
  const patients = data?.patients ?? [];

  const isEmpty = metrics.totalPatientsMonitored === 0 && patients.length === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <h1 className="sr-only">Dashboard</h1>

      {status === "loading" && (
        <>
          <Loading variant="cards" label="Loading dashboard" />
          <div className="bg-white border border-[#C6C6CD99] rounded-2xl">
            <Loading variant="table" rows={5} label="Loading patients" />
          </div>
        </>
      )}

      {status === "error" && <ErrorState onRetry={loadDashboard} />}

      {status === "success" && data && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total Patients Monitored"
              value={metrics.totalPatientsMonitored}
              icon={<LucideUser className="size-4" />}
              iconColor="text-[#2563EB]"
              badgeClass="bg-[#DCFCE7] text-[#15803D]"
              caption="From the last week"
              change={metrics.totalPatientsChange}
            />
            <SummaryCard
              label="Needs Attention"
              value={metrics.totalPatientsNeedingAttention}
              icon={<LucideClock className="size-4" />}
              iconColor="text-[#EAB308]"
              badgeClass="bg-[#FEF9C3] text-[#A16207]"
              caption="Immediate review"
              change={metrics.needsAttentionChange}
            />
            <SummaryCard
              label="Emergency Alerts"
              value={metrics.totalEmergencyAlerts}
              icon={
                <span className="flex size-4 items-center justify-center rounded-[4px] border border-current">
                  <LucideActivity className="size-2.5" />
                </span>
              }
              iconColor="text-[#EF4444]"
              badgeClass="bg-[#FEE2E2] text-[#DC2626]"
              caption="From the last week"
              change={metrics.emergencyAlertsChange}
            />

            <StatusOverview
              metrics={metrics}
              statusBreakdown={statusBreakdown}
              className="sm:col-span-2"
            />
            <Calendar />
          </div>

          <section aria-label="Patients" className="flex flex-col gap-3">
            <div role="table" aria-label="Patients" className="flex flex-col gap-3">
              <div
                role="row"
                className={`hidden sm:grid ${columns} items-center gap-x-3 border border-transparent px-6 text-[12px] sm:text-[15px] text-primary`}
              >
                <span role="columnheader">Patients ID</span>
                <span role="columnheader" className="text-center">Current Condition</span>
                <span role="columnheader" className="text-center">Status</span>
                <span role="columnheader" aria-label="Actions" className="flex justify-end">
                  <LucideSlidersHorizontal className="size-4 text-[#6B7C93]" aria-hidden="true" />
                </span>
              </div>

              <div
                role="rowgroup"
                className="rounded-xl border border-[#C6C6CD99] bg-white overflow-hidden divide-y divide-[#C6C6CD99]"
              >
                {isEmpty ? (
                  <EmptyState />
                ) : patients.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] sm:text-[14px] text-[#6B7C93]">
                    No patients on this page.
                  </p>
                ) : (
                  patients.map((patient) => <PatientRow key={patient.id} patient={patient} />)
                )}
              </div>
            </div>

            {patients.length > 0 && (
              <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">
                {patients.length} {patients.length === 1 ? "patient" : "patients"}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;