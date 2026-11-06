import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LucideAlertTriangle,
  LucideArrowLeft,
  LucideChevronDown,
  LucideInfo,
  LucideRefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Loading from "../components/Loading";
import { useRequest } from "../data/useRequest";
import {
  exportReport,
  getAdminDashboard,
  saveAdminNote,
  type AdminAlert,
  type AlertQueueStatus,
} from "../services/apiAdminDashboard";
import { getErrorMessage, getPatients } from "../services/apiPatients";
import patients from "../assets/profile-2user-active.svg";
import alerts from "../assets/menu-board.svg"
import activity from "../assets/dashboard-activity.svg";
import sla from "../assets/sla-clock.svg"
import emergency from "../assets/emergency.svg";
import resolved from "../assets/resolved.svg";
import users from "../assets/profile-2user.svg"

type AlertFilter = "all" | AlertQueueStatus;
type IconSource = string | LucideIcon;

const AppIcon = ({ icon: Icon, className }: { icon: IconSource; className?: string }) =>
  typeof Icon === "string" ? (
    <img src={Icon} alt="" aria-hidden="true" className={className} />
  ) : (
    <Icon className={className} aria-hidden="true" />
  );

const filterOptions: { value: AlertFilter; label: string }[] = [
  { value: "all", label: "All alerts" },
  { value: "critical", label: "Critical" },
  { value: "monitored", label: "Monitored" },
  { value: "resolved", label: "Resolved" },
];

const alertStyles: Record<
  AlertQueueStatus,
  { label: string; pill: string; iconWrap: string; Icon: IconSource }
> = {
  critical: {
    label: "Critical",
    pill: "border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]",
    iconWrap: "border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]",
    Icon: emergency,
  },
  monitored: {
    label: "Monitored",
    pill: "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]",
    iconWrap: "border-[#FDE68A] bg-[#FFFBEB] text-[#CA8A04]",
    Icon: sla,
  },
  resolved: {
    label: "Resolved",
    pill: "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]",
    iconWrap: "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
    Icon: resolved,
  },
};

const cardClass = "rounded-xl border border-[#C6C6CD99] bg-white p-5";
const headingClass = "text-[16px] sm:text-[18px] font-semibold text-primary";

const formatNumber = (value: number) => value.toLocaleString("en-US");

const SelectBox = ({
  value,
  label,
  onChange,
  children,
}: {
  value: string;
  label: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}) => (
  <div className="relative shrink-0">
    <select
      value={value}
      aria-label={label}
      onChange={(event) => onChange?.(event.target.value)}
      className="w-full cursor-pointer appearance-none rounded-lg border border-[#C6C6CD99] bg-[#F8F9FF] py-2 pl-3 pr-8 text-[12px] sm:text-[13px] text-primary outline-none focus:border-[#2563EB]"
    >
      {children}
    </select>
    <LucideChevronDown
      className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#6B7C93]"
      aria-hidden="true"
    />
  </div>
);

interface StatCardProps {
  label: string;
  value: string;
  caption: string;
  tone: string;
  iconTone: string;
  Icon: IconSource;
}

const StatCard = ({ label, value, caption, tone, iconTone, Icon }: StatCardProps) => (
  <div className={`rounded-xl border p-4 sm:p-5 ${tone}`}>
    <div className="flex items-center gap-2.5">
      <span className={`flex size-8 items-center justify-center rounded-lg ${iconTone}`} aria-hidden="true">
        <AppIcon icon={Icon} className="size-4" />
      </span>
      <p className="text-[12px] sm:text-[13px] text-primary">{label}</p>
    </div>
    <p className="mt-3 text-[24px] sm:text-[28px] font-semibold leading-tight text-primary">{value}</p>
    <p className="mt-1 text-[11px] sm:text-[12px] text-[#6B7C93]">{caption}</p>
  </div>
);

const AlertRow = ({ alert }: { alert: AdminAlert }) => {
  const { label, pill, iconWrap, Icon } = alertStyles[alert.status];

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-[#C6C6CD99] bg-white px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${iconWrap}`}
        >
          <AppIcon icon={Icon} className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] sm:text-[14px] font-semibold text-primary">{alert.patientName}</p>
          <p className="truncate text-[11px] sm:text-[12px] text-[#6B7C93]">
            {alert.detection}
            {alert.howLong ? ` \u2022 ${alert.howLong}` : ""}
          </p>
        </div>
      </div>
      <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] sm:text-[12px] font-medium ${pill}`}>
        {label}
      </span>
    </li>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, reload } = useRequest("admin-dashboard", getAdminDashboard);

  const [filter, setFilter] = useState<AlertFilter>("all");
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const queueRef = useRef<HTMLElement>(null);

  const handleReviewAlerts = () => {
    setFilter("critical");
    queueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleHistory = async () => {
    try {
      const patients = await getPatients();
      if (patients.length === 0) {
        toast("There are no patients to show history for yet.");
        return;
      }
      navigate(`/patient/${patients[0].id}/history`);
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't open patient history. Please try again."));
    }
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportReport(data?.quickActions.exportReportUrl || "/admin/reports/export");
      toast.success("Report exported");
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't export the report. Please try again."));
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveNote = async () => {
    const content = note.trim();
    if (!content || isSavingNote) return;

    setIsSavingNote(true);
    try {
      await saveAdminNote(content);
      toast.success("Note saved");
      setNote("");
    } catch (err) {
      toast.error(getErrorMessage(err, "We couldn't save your note. Please try again."));
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Loading variant="cards" label="Loading dashboard" />
        <div className="rounded-lg border border-[#C6C6CD99] bg-white">
          <Loading variant="table" rows={4} label="Loading alerts" />
        </div>
      </div>
    );
  }

  if (error != null || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-[#C6C6CD99] bg-white p-8 text-center sm:p-10"
        >
          <div className="rounded-lg bg-[#FDECEC] p-3">
            <LucideAlertTriangle className="size-6 text-[#8A1F1F]" />
          </div>
          <p className="font-semibold text-[16px] sm:text-[18px] text-primary">
            We couldn't load the admin dashboard
          </p>
          <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">
            Check your connection, then try again.
          </p>
          <button
            type="button"
            onClick={reload}
            className="flex cursor-pointer items-center gap-2 rounded-lg border-[1.5px] border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white"
          >
            <LucideRefreshCw className="size-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { metrics, alertQueue, authorizedUsers } = data;
  const visibleAlerts = alertQueue.filter((alert) => filter === "all" || alert.status === filter);
  const critical = metrics.criticalCount;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">
      <h1 className="sr-only">Admin dashboard</h1>

      <p className="flex items-center gap-2 text-[12px] sm:text-[13px]">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-[#2563EB]">
          <LucideArrowLeft className="size-4" aria-hidden="true" />
          Dashboard
        </Link>
        <span className="text-[#6B7C93]">/</span>
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active patients"
          value={formatNumber(metrics.activePatients)}
          caption={`Out of ${formatNumber(metrics.totalPatients)} total`}
          tone="border-[#DBEAFE] bg-[#EAF2FF]"
          iconTone="bg-[#DBEAFE] text-[#2563EB]"
          Icon={patients}
        />
        <StatCard
          label="Active alerts"
          value={formatNumber(metrics.activeAlerts)}
          caption={`${formatNumber(metrics.criticalCount)} critical, ${formatNumber(metrics.monitoredCount)} monitored`}
          tone="border-[#BBF7D0] bg-[#EAF8EE]"
          iconTone="bg-[#D1FAE5] text-[#16A34A]"
          Icon={activity}
        />
        <StatCard
          label="Response SLA"
          value={metrics.responseSla}
          caption="Within 5 min target"
          tone="border-[#FEF08A] bg-[#FEF9D9]"
          iconTone="bg-[#FEF08A] text-[#A16207]"
          Icon={sla}
        />
        <StatCard
          label="Total Patients"
          value={formatNumber(metrics.totalPatients)}
          caption="All registered patients"
          tone="border-[#E2E8F0] bg-[#F1F2F6]"
          iconTone="bg-[#E2E8F0] text-[#475569]"
          Icon={alerts}
        />
      </div>

      <section
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-[#FCA5A5] bg-[#FEE2E2] p-4"
      >
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]"
        >
          <LucideAlertTriangle className="size-4" />
        </span>
        <div>
          <h2 className="text-[14px] sm:text-[16px] font-semibold text-primary">
            {critical} critical alert{critical === 1 ? "" : "s"} need{critical === 1 ? "s" : ""} attention
          </h2>
          <p className="mt-0.5 text-[12px] sm:text-[13px] text-primary">
            Review the priority queue, assign follow-up tasks, and confirm resolution for the highest-risk cases.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.9fr_1fr]">
        <div className="flex flex-col gap-5">
          <section ref={queueRef} className={`${cardClass} scroll-mt-24`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={headingClass}>Alert queue</h2>
              <SelectBox
                label="Filter alerts"
                value={filter}
                onChange={(value) => setFilter(value as AlertFilter)}
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectBox>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Alert filters">
              {filterOptions.map((option) => {
                const isActive = filter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setFilter(option.value)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] sm:text-[12px] ${
                      isActive
                        ? "border-[#93C5FD] bg-[#E0EDFF] text-[#1D4ED8]"
                        : "border-[#C6C6CD] bg-white text-[#6B7C93]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {visibleAlerts.length === 0 ? (
              <p className="py-10 text-center text-[13px] sm:text-[14px] text-[#6B7C93]">
                {alertQueue.length === 0 ? "No alerts in the queue." : "No alerts match this filter."}
              </p>
            ) : (
              <ul className="mt-4 flex max-h-[26rem] flex-col gap-3 overflow-y-auto">
                {visibleAlerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} />
                ))}
              </ul>
            )}
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={headingClass}>Authorized users</h2>
              <SelectBox label="Filter by team" value="all">
                <option value="all">All teams</option>
              </SelectBox>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { label: "Total users", value: authorizedUsers.totalUsers },
                { label: "Active admins", value: authorizedUsers.activeAdmins },
                { label: "Pending invites", value: authorizedUsers.pendingInvites },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[#C6C6CD99] p-4">
                  <p className="text-[11px] sm:text-[12px] text-primary">{item.label}</p>
                  <p className="mt-2 text-[20px] sm:text-[22px] font-semibold text-primary">
                    {formatNumber(item.value)}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 flex items-start gap-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
              <img src={users} alt="Users" className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Review pending invites and confirm admin access before the end of the month.
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <section className={cardClass}>
            <h2 className={headingClass}>Quick actions</h2>

            <div className="mt-4 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleReviewAlerts}
                className="w-full cursor-pointer rounded-lg bg-[#2563EB] py-2.5 text-[13px] sm:text-[14px] font-medium text-white"
              >
                Review alerts
              </button>
              <button
                type="button"
                onClick={handleHistory}
                className="w-full cursor-pointer rounded-lg border border-[#C6C6CD] bg-white py-2.5 text-[13px] sm:text-[14px] font-medium text-primary"
              >
                History
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full cursor-pointer rounded-lg bg-[#1E293B] py-2.5 text-[13px] sm:text-[14px] font-medium text-white disabled:cursor-wait disabled:opacity-70"
              >
                {isExporting ? "Exporting..." : "Export report"}
              </button>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={headingClass}>Admin note</h2>
            <p className="mt-2 text-[12px] sm:text-[13px] text-[#6B7C93]">
              Document operational notes, billing reminders, or follow-up tasks for the team.
            </p>

            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSaveNote();
              }}
              placeholder="Add an admin note..."
              aria-label="Admin note"
              className="mt-4 w-full rounded-lg border border-[#C6C6CD] bg-white px-3 py-2 text-[12px] sm:text-[13px] text-primary outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
            />
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={!note.trim() || isSavingNote}
              className="mt-3 w-full cursor-pointer rounded-lg border border-[#C6C6CD] bg-white py-2.5 text-[13px] sm:text-[14px] font-medium text-primary disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
            >
              {isSavingNote ? "Saving..." : "Save note"}
            </button>

            <p className="mt-3 flex items-start gap-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
              <LucideInfo className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Use this note for billing follow-up, team handoffs, or operational reminders.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;