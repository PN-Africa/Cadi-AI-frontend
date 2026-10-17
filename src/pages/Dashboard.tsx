import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LucideAlertTriangle,
  LucideRefreshCw,
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

const statusStyles: Record<
  DashboardPatientStatus,
  { badge: string }
> = {
  Normal: { badge: "bg-[#E7F6EC] text-[#1E7D3B]" },
  "Needs Attention": { badge: "bg-[#FFF8E6] text-[#8A6116]" },
  Emergency: { badge: "bg-[#FDECEC] text-[#8A1F1F]" },
};

const StatusBadge = ({ status }: { status: DashboardPatientStatus }) => {
  const { badge } = statusStyles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[12px] sm:text-[13px] font-medium ${badge}`}
    >
      {/* <Icon className="size-4 shrink-0" /> */}
      {status}
    </span>
  );
};

interface SummaryCardProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
}

const SummaryCard = ({ label, value }: SummaryCardProps) => (
  <div className="bg-white border border-[#C6C6CD99] rounded-lg p-4 sm:p-5 flex items-center gap-3">
    {/* <div className={`${iconBg} rounded-lg p-2`}>
      <Icon className={`size-6 ${iconColor}`} />
    </div> */}
    <div>
      <p className="text-[20px] sm:text-[22px] font-semibold text-primary">{value}</p>
      <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">{label}</p>
    </div>
  </div>
);

const StatusOverview = ({
  metrics,
  statusBreakdown,
}: {
  metrics: DashboardMetrics;
  statusBreakdown: DashboardStatusBreakdown;
}) => {
  const segments = [
    { label: "Normal", value: statusBreakdown.normal, color: "#22C55E" },
    { label: "Needs Attention", value: statusBreakdown.needsAttention, color: "#FACC15" },
    { label: "Emergency", value: statusBreakdown.emergency, color: "#EF4444" },
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
    <section className="bg-white border border-[#C6C6CD99] rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-around gap-6">
      <div>
        <h2 className="font-semibold text-[15px] sm:text-[16px] text-primary mb-3">
          Patient Status
        </h2>
        <ul className="flex flex-col gap-2">
          {segments.map((segment) => (
            <li
              key={segment.label}
              className="flex items-center gap-2 text-[13px] sm:text-[14px] text-primary"
            >
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              />
              {segment.label}
              <span className="text-[#6B7C93]">{segment.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="relative size-40 sm:size-44 mx-auto sm:mx-0"
        role="img"
        aria-label={`${metrics.totalPatientsMonitored} patients: ${statusBreakdown.normal} normal, ${statusBreakdown.needsAttention} need attention, ${statusBreakdown.emergency} emergency`}
      >
        <svg viewBox="0 0 36 36" className="size-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15.9155"
            fill="none"
            stroke="#E4E8F0"
            strokeWidth="5"
          />
          {arcs.map(
            (arc) =>
              arc.percent > 0 && (
                <circle
                  key={arc.label}
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="5"
                  strokeDasharray={`${arc.percent} ${100 - arc.percent}`}
                  strokeDashoffset={-arc.offset}
                />
              )
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[22px] font-semibold text-primary">{metrics.totalPatientsMonitored}</p>
          <p className="text-[12px] text-[#6B7C93]">Patients</p>
        </div>
      </div>
    </section>
  );
};

const PatientsTable = ({ patients }: { patients: DashboardPatient[] }) => {
  if (patients.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-[13px] sm:text-[14px] text-[#6B7C93]">
        No patients on this page.
      </p>
    );
  }

  const headerClass = "px-4 py-3 text-[12px] sm:text-[13px] font-medium text-[#6B7C93]";

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead className="bg-[#EEF4FF]">
          <tr>
            <th scope="col" className={headerClass}>Patient</th>
            <th scope="col" className={headerClass}>Patient ID</th>
            <th scope="col" className={headerClass}>Current Condition</th>
            <th scope="col" className={headerClass}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#C6C6CD99]">
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td className="px-4 py-3 text-[13px] sm:text-[14px]">
                <Link
                  to={`/patients/${patient.id}`}
                  className="text-primary font-medium hover:underline"
                >
                  {patient.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-[13px] sm:text-[14px] text-primary">
                {patient.patientId}
              </td>
              <td className="px-4 py-3 text-[13px] sm:text-[14px] text-primary">
                {patient.currentCondition}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={patient.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div
    role="alert"
    className="bg-white border border-[#C6C6CD99] rounded-lg p-8 sm:p-10 flex flex-col items-center text-center gap-3"
  >
    <div className="bg-[#FDECEC] rounded-lg p-3">
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
      className="text-white bg-[#3B82F6] cursor-pointer border-[1.5px] rounded-lg border-[#3B82F6] px-4 py-2 text-[13px] sm:text-[14px] flex items-center gap-2"
    >
      <LucideRefreshCw className="size-4" />
      Try Again
    </button>
  </div>
);

const EmptyState = () => (
  <div className="bg-white border border-[#C6C6CD99] rounded-[2rem] p-8 sm:p-10 flex flex-col items-center text-center gap-3">
    <div className="bg-[#EEF3FC] rounded-lg p-3">
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

  const isEmpty =
    data !== null && data.metrics.totalPatientsMonitored === 0 && data.patients.length === 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <h1 className="sr-only">Dashboard</h1>

      {status === "loading" && (
        <>
          <Loading variant="cards" label="Loading dashboard" />
          <div className="bg-white border border-[#C6C6CD99] rounded-lg">
            <Loading variant="table" rows={5} label="Loading patients" />
          </div>
        </>
      )}

      {status === "error" && <ErrorState onRetry={loadDashboard} />}

      {status === "success" && data && isEmpty && <EmptyState />}

      {status === "success" && data && !isEmpty && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Patients Monitored"
              value={data.metrics.totalPatientsMonitored}
              // icon={usericon}
              iconBg="bg-[#EEF3FC]"
              iconColor="text-[#0D469C]"
            />
            <SummaryCard
              label="Needs Attention"
              value={data.metrics.totalPatientsNeedingAttention}
              iconBg="bg-[#FFF8E6]"
              iconColor="text-[#8A6116]"
            />
            <SummaryCard
              label="Emergency Alerts"
              value={data.metrics.totalEmergencyAlerts}
              iconBg="bg-[#FDECEC]"
              iconColor="text-[#8A1F1F]"
            />
          </div>

          <StatusOverview
            metrics={data.metrics}
            statusBreakdown={data.statusBreakdown}
          />

          <section className="bg-white border border-[#C6C6CD99] rounded-lg overflow-hidden">
            <PatientsTable patients={data.patients} />
            <div className="flex items-center px-4 py-3 border-t border-[#C6C6CD99]">
              <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">
                {data.patients.length}{" "}
                {data.patients.length === 1 ? "patient" : "patients"}
              </p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;