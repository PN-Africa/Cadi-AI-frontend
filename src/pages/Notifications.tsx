import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LucideClipboardList, LucideInfo } from "lucide-react";
import Pagination from "../components/Pagination";
import { useAuthStore } from "../auth/auth";

type AlertType = "urgent" | "follow-up" | "update";
type Filter = "all" | "unread" | "urgent" | "follow-up" | "read";

interface NotificationAlert {
  id: string;
  patientId: string;
  type: AlertType;
  read: boolean;
}

const mockPatients: Record<string, { name: string; code: string }> = {
  "mock-james-okarfor": { name: "James Okarfor", code: "N2S458J" },
  "mock-john-wick": { name: "John Wick", code: "H3I847L" },
  "mock-white-esther": { name: "White Esther", code: "W4H562K" },
};

const james = "mock-james-okarfor";
const john = "mock-john-wick";
const esther = "mock-white-esther";

// Newest first. 14 alerts: 6 unread, 3 urgent, 5 follow-up, 6 updates.
const mockAlerts: NotificationAlert[] = [
  { id: "n1", patientId: james, type: "urgent", read: false },
  { id: "n2", patientId: john, type: "urgent", read: false },
  { id: "n3", patientId: esther, type: "follow-up", read: true },
  { id: "n4", patientId: james, type: "urgent", read: false },
  { id: "n5", patientId: john, type: "follow-up", read: false },
  { id: "n6", patientId: esther, type: "follow-up", read: false },
  { id: "n7", patientId: james, type: "update", read: false },
  { id: "n8", patientId: john, type: "follow-up", read: true },
  { id: "n9", patientId: esther, type: "follow-up", read: true },
  { id: "n10", patientId: james, type: "update", read: true },
  { id: "n11", patientId: john, type: "update", read: true },
  { id: "n12", patientId: esther, type: "update", read: true },
  { id: "n13", patientId: james, type: "update", read: true },
  { id: "n14", patientId: john, type: "update", read: true },
];

const PAGE_SIZE = 3;

const typeStyles: Record<AlertType, { label: string; pill: string; dot: string; text: string }> = {
  urgent: {
    label: "Urgent",
    pill: "bg-[#FEE2E2] text-[#DC2626]",
    dot: "bg-[#DC2626]",
    text: "Emergency flag. Review patient details.",
  },
  "follow-up": {
    label: "Follow-up",
    pill: "bg-[#FEF9C3] text-[#B45309]",
    dot: "bg-[#EAB308]",
    text: "Needs attention. Follow up with this patient.",
  },
  update: {
    label: "Update",
    pill: "bg-[#E2E8F0] text-[#475569]",
    dot: "bg-[#64748B]",
    text: "Monitoring update for this patient.",
  },
};

const columns =
  "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_5rem_8rem]";

const Notifications = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const roleLabel = user?.role
    ?.trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  const userName = user?.name?.trim() || user?.email || "";

  const [filter, setFilter] = useState<Filter>("all");
  const [newestFirst, setNewestFirst] = useState(true);
  const [page, setPage] = useState(1);
  const [readIds, setReadIds] = useState<string[]>([]);

  const alerts = mockAlerts.map((alert) => ({
    ...alert,
    read: alert.read || readIds.includes(alert.id),
  }));

  const counts = {
    all: alerts.length,
    unread: alerts.filter((alert) => !alert.read).length,
    urgent: alerts.filter((alert) => alert.type === "urgent").length,
    "follow-up": alerts.filter((alert) => alert.type === "follow-up").length,
    read: alerts.filter((alert) => alert.read).length,
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All alerts" },
    { key: "unread", label: "Unread" },
    { key: "urgent", label: "Urgent" },
    { key: "follow-up", label: "Follow-up" },
    { key: "read", label: "Read" },
  ];

  const matching = alerts
    .filter((alert) => {
      if (filter === "unread") return !alert.read;
      if (filter === "read") return alert.read;
      if (filter === "urgent" || filter === "follow-up") return alert.type === filter;
      return true;
    });
  const ordered = newestFirst ? matching : [...matching].reverse();

  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visible = ordered.slice(pageStart, pageStart + PAGE_SIZE);

  const firstAlert = alerts.find((alert) => !alert.read && alert.type === "urgent")
    ?? alerts.find((alert) => !alert.read);

  const openAlert = (alert: NotificationAlert) => {
    setReadIds((ids) => (ids.includes(alert.id) ? ids : [...ids, alert.id]));
    navigate(`/patient/${alert.patientId}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] text-primary">
            {roleLabel ? `${roleLabel} Notifications` : "Notifications"}
          </h1>
          <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7C93]">
            {counts.all} alerts &bull; {counts.unread} unread &bull; {counts.urgent} urgent
          </p>
        </div>

        {roleLabel && userName && (
          <p className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-[#6B7C93]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#2563EB]" />
            {roleLabel}: {userName}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4" role="group" aria-label="Filter alerts">
        {tabs.map((tab) => {
          const isActive = filter === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setFilter(tab.key);
                setPage(1);
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-[12px] sm:text-[13px] ${
                isActive
                  ? "border-[#93C5FD] bg-[#E0EDFF] text-[#1D4ED8]"
                  : "border-[#C6C6CD] bg-white text-[#6B7C93]"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-md px-1.5 text-[10px] sm:text-[11px] ${
                  isActive ? "bg-white/70 text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#6B7C93]"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <section className="rounded-xl border border-[#C6C6CD99] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5">
          <h2 className="font-medium text-[14px] sm:text-[18px] my-1 text-primary">
            Feed
          </h2>
          <label className="flex items-center gap-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
            Sort by:
            <select
              value={newestFirst ? "newest" : "oldest"}
              onChange={(e) => {
                setNewestFirst(e.target.value === "newest");
                setPage(1);
              }}
              className="cursor-pointer bg-transparent font-medium text-primary outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>

        <div
          role="table"
          aria-label={roleLabel ? `${roleLabel} notification feed` : "Notification feed"}
        >
          <div
            role="row"
            className={`hidden md:grid ${columns} items-center gap-x-4 bg-[#F8F9FF] px-5 py-3 text-[11px] sm:text-[12px] font-medium text-[#6B7C93]`}
          >
            <span role="columnheader">Source patient</span>
            <span role="columnheader">Alert / context</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Action</span>
          </div>

          <div role="rowgroup" className="divide-y divide-[#C6C6CD99] border-t border-[#C6C6CD99]">
            {visible.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] sm:text-[14px] text-[#6B7C93]">
                No alerts match this filter.
              </p>
            ) : (
              visible.map((alert) => {
                const patient = mockPatients[alert.patientId];
                const style = typeStyles[alert.type];
                const initials = patient.name
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("");

                return (
                  <div
                    key={alert.id}
                    role="row"
                    className={`grid ${columns} items-center gap-x-4 gap-y-3 px-4 py-5 sm:px-5`}
                  >
                    <div role="cell" className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EEF3FC] text-[11px] font-medium text-[#2563EB]"
                      >
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] sm:text-[14px] font-semibold text-primary">
                          {patient.name}
                        </p>
                        <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">{patient.code}</p>
                      </div>
                    </div>

                    <div
                      role="cell"
                      className="col-start-2 row-start-1 md:col-start-4 md:row-start-1"
                    >
                      <button
                        type="button"
                        onClick={() => openAlert(alert)}
                        className="cursor-pointer rounded-xl border border-[#2563EB] bg-white px-4 py-2 text-[12px] sm:text-[13px] font-medium text-[#2563EB]"
                      >
                        Review alert
                      </button>
                    </div>

                    <div
                      role="cell"
                      className="col-start-1 row-start-2 md:col-start-2 md:row-start-1"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] sm:text-[12px] font-medium ${style.pill}`}
                      >
                        <span aria-hidden="true" className={`size-1.5 rounded-full ${style.dot}`} />
                        {style.label}
                      </span>
                      <p className="mt-1 text-[11px] sm:text-[12px] text-[#6B7C93]">{style.text}</p>
                    </div>

                    <div
                      role="cell"
                      className="col-start-2 row-start-2 justify-self-end md:col-start-3 md:row-start-1 md:justify-self-start"
                    >
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] sm:text-[12px] font-medium ${
                          alert.read
                            ? "bg-[#F1F5F9] text-[#6B7C93]"
                            : "bg-[#E0EDFF] text-[#1D4ED8]"
                        }`}
                      >
                        {alert.read ? "Read" : "Unread"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#C6C6CD99] px-4 py-3 sm:flex-row sm:px-5">
          <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
            {ordered.length === 0
              ? "Showing 0 of 0 alerts"
              : `Showing ${pageStart + 1}\u2013${pageStart + visible.length} of ${ordered.length} alerts`}
          </p>
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>

      <div className="text-[11px] sm:text-[12px] text-[#6B7C93]">
        <p className="flex items-center gap-2">
          <LucideInfo className="size-3.5 shrink-0" aria-hidden="true" />
          Review urgent alerts first, then follow up on outstanding notifications.
        </p>
        <p className="mt-0.5 pl-[22px]">
          Monitoring information supports clinical review, not diagnosis.
        </p>
      </div>
    </div>
  );
};

export default Notifications;