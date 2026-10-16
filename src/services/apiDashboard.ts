import { axiosPrivate } from "../lib/axios";

export type PatientStatus = "Normal" | "Needs Attention" | "Alert";

export interface DashboardSummary {
  totalPatients: number;
  normal: number;
  needsAttention: number;
  alerts: number;
}

export interface DashboardPatient {
  id: string;
  name: string;
  patientCode: string;
  recentActivity: string;
  status: PatientStatus;
}

export interface DashboardAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  severity: Exclude<PatientStatus, "Normal">;
  reason: string;
  timestamp: string;
}

export interface DashboardPagination {
  page: number;
  totalPages: number;
  total: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  patients: DashboardPatient[];
  alerts: DashboardAlert[];
  pagination: DashboardPagination;
}

// Assumed backend response shape for GET /dashboard?page=N. If the real
// contract differs, adjust this interface and normalizeDashboard() below.
// Nothing else in the UI depends on the raw shape.
interface DashboardApiResponse {
  summary?: {
    totalPatients?: number;
    normal?: number;
    needsAttention?: number;
    alerts?: number;
  };
  data?: Array<{
    id: string;
    name?: string;
    patientCode?: string;
    recentActivity?: string;
    status?: string;
  }>;
  alerts?: Array<{
    id: string;
    patientId: string;
    patientName?: string;
    type?: string;
    severity?: string;
    reason?: string;
    timestamp?: string;
  }>;
  meta?: {
    total?: number;
    page?: number;
    totalPages?: number;
  };
}

const normalizeStatus = (value?: string): PatientStatus => {
  const key = (value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (key === "NORMAL") return "Normal";
  if (key === "ALERT" || key === "EMERGENCY") return "Alert";

  // Anything unrecognised is treated as needing attention, so an unknown
  // status is never shown as reassuring.
  return "Needs Attention";
};

const normalizeDashboard = (raw: DashboardApiResponse, page: number): DashboardData => {
  const totalPatients = raw.summary?.totalPatients ?? 0;
  const needsAttention = raw.summary?.needsAttention ?? 0;
  const alerts = raw.summary?.alerts ?? 0;
  const normal =
    raw.summary?.normal ?? Math.max(totalPatients - needsAttention - alerts, 0);

  const patients: DashboardPatient[] = (raw.data ?? []).map((patient) => ({
    id: patient.id,
    name: patient.name ?? "Unnamed patient",
    patientCode: patient.patientCode ?? "",
    recentActivity: patient.recentActivity ?? "No recent activity",
    status: normalizeStatus(patient.status),
  }));

  const alertItems: DashboardAlert[] = (raw.alerts ?? []).map((alert) => ({
    id: alert.id,
    patientId: alert.patientId,
    patientName: alert.patientName ?? "Unnamed patient",
    type: alert.type ?? "Update",
    severity: normalizeStatus(alert.severity) === "Alert" ? "Alert" : "Needs Attention",
    reason: alert.reason ?? "",
    timestamp: alert.timestamp ?? "",
  }));

  return {
    summary: { totalPatients, normal, needsAttention, alerts },
    patients,
    alerts: alertItems,
    pagination: {
      page: raw.meta?.page ?? page,
      totalPages: Math.max(raw.meta?.totalPages ?? 1, 1),
      total: raw.meta?.total ?? patients.length,
    },
  };
};

export const getDashboard = async (page = 1): Promise<DashboardData> => {
  const res = await axiosPrivate.get<DashboardApiResponse>(`/dashboard`, {
    params: { page },
  });
  return normalizeDashboard(res.data, page);
};