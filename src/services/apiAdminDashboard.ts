import { axiosPrivate } from "../lib/axios";
import { dedupeRequest } from "../lib/dedupeRequest";

interface AdminDashboardResponse {
  metrics?: {
    activePatients?: number;
    activeAlerts?: number;
    responseSla?: string;
    totalPatients?: number;
    criticalCount?: number;
    monitoredCount?: number;
  };
  alertQueue?: {
    id: string;
    patientName?: string;
    status?: string;
    detection?: string;
    howLong?: string;
  }[];
  authorizedUsers?: {
    totalUsers?: number;
    activeAdmins?: number;
    pendingInvites?: number;
  };
  quickActions?: {
    reviewAlertsUrl?: string;
    historyUrl?: string;
    exportReportUrl?: string;
  };
  adminNotes?: { id: string; noteContent: string; createdAt: string }[];
}

export type AlertQueueStatus = "critical" | "monitored" | "resolved";

export interface AdminMetrics {
  activePatients: number;
  activeAlerts: number;
  responseSla: string;
  totalPatients: number;
  criticalCount: number;
  monitoredCount: number;
}

export interface AdminAlert {
  id: string;
  patientName: string;
  status: AlertQueueStatus;
  detection: string;
  howLong: string;
}

export interface AuthorizedUsers {
  totalUsers: number;
  activeAdmins: number;
  pendingInvites: number;
}

export interface QuickActions {
  reviewAlertsUrl: string;
  historyUrl: string;
  exportReportUrl: string;
}

export interface AdminNote {
  id: string;
  noteContent: string;
  createdAt: string;
}

export interface AdminDashboardData {
  metrics: AdminMetrics;
  alertQueue: AdminAlert[];
  authorizedUsers: AuthorizedUsers;
  quickActions: QuickActions;
  adminNotes: AdminNote[];
}

const normalizeAlertStatus = (value?: string): AlertQueueStatus => {
  const key = (value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (key === "EMERGENCY" || key === "CRITICAL") return "critical";
  if (key === "RESOLVED" || key === "NORMAL") return "resolved";
  return "monitored";
};

const toAdminDashboard = (raw: AdminDashboardResponse): AdminDashboardData => ({
  metrics: {
    activePatients: raw.metrics?.activePatients ?? 0,
    activeAlerts: raw.metrics?.activeAlerts ?? 0,
    responseSla: raw.metrics?.responseSla ?? "0%",
    totalPatients: raw.metrics?.totalPatients ?? 0,
    criticalCount: raw.metrics?.criticalCount ?? 0,
    monitoredCount: raw.metrics?.monitoredCount ?? 0,
  },
  alertQueue: (raw.alertQueue ?? []).map((alert) => ({
    id: alert.id,
    patientName: alert.patientName ?? "Unknown patient",
    status: normalizeAlertStatus(alert.status),
    detection: alert.detection ?? "Alert detected",
    howLong: alert.howLong ?? "",
  })),
  authorizedUsers: {
    totalUsers: raw.authorizedUsers?.totalUsers ?? 0,
    activeAdmins: raw.authorizedUsers?.activeAdmins ?? 0,
    pendingInvites: raw.authorizedUsers?.pendingInvites ?? 0,
  },
  quickActions: {
    reviewAlertsUrl: raw.quickActions?.reviewAlertsUrl ?? "/admin/alerts/review",
    historyUrl: raw.quickActions?.historyUrl ?? "/admin/history",
    exportReportUrl: raw.quickActions?.exportReportUrl ?? "/admin/reports/export",
  },
  adminNotes: raw.adminNotes ?? [],
});

export const getAdminDashboard = (): Promise<AdminDashboardData> =>
  dedupeRequest("admin-dashboard", async () => {
    const res = await axiosPrivate.get<AdminDashboardResponse>(`/admin/dashboard`);
    return toAdminDashboard(res.data ?? {});
  });

export const saveAdminNote = async (noteContent: string) => {
  await axiosPrivate.post(`/admin/dashboard/notes`, { noteContent });
};

export const exportReport = async (url: string) => {
  const res = await axiosPrivate.get<Blob>(url, { responseType: "blob" });

  const type = String(res.headers?.["content-type"] ?? "");
  const extension = type.includes("pdf") ? ".pdf" : type.includes("csv") ? ".csv" : "";
  const disposition = String(res.headers?.["content-disposition"] ?? "");
  const named = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)?.[1];
  const filename = named
    ? decodeURIComponent(named)
    : `admin-report-${new Date().toISOString().slice(0, 10)}${extension}`;

  const objectUrl = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
};