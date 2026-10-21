import { axiosPrivate } from "../lib/axios";
import { dedupeRequest } from "../lib/dedupeRequest";

export type PatientStatus = "Normal" | "Needs Attention" | "Alert";

export interface DashboardSummary {
  totalPatients: number;
  normal: number;
  needsAttention: number;
  alerts: number;
}

export interface DashboardMetrics {
  totalPatientsMonitored: number;
  totalPatientsNeedingAttention: number;
  totalEmergencyAlerts: number;
}

export interface DashboardStatusBreakdown {
  normal: number;
  needsAttention: number;
  emergency: number;
}

export interface DashboardPatient {
  id: string;
  name: string;
  patientCode: string;
  recentActivity: string;
  status: DashboardPatientStatus;
}

export type DashboardPatientStatus = "Normal" | "Needs Attention" | "Emergency";

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
  metrics: DashboardMetrics;
  statusBreakdown: DashboardStatusBreakdown;
  summary: DashboardSummary;
  patients: DashboardPatient[];
  alerts: DashboardAlert[];
  pagination: DashboardPagination;
}

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

  return "Needs Attention";
};

const normalizeDashboardPatientStatus = (value?: string): DashboardPatientStatus => {
  const status = normalizeStatus(value);
  return status === "Alert" ? "Emergency" : status;
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
    status: normalizeDashboardPatientStatus(patient.status),
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
    metrics: {
      totalPatientsMonitored: totalPatients,
      totalPatientsNeedingAttention: needsAttention,
      totalEmergencyAlerts: alerts,
    },
    statusBreakdown: {
      normal,
      needsAttention,
      emergency: alerts,
    },
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

export const getDashboard = (page = 1): Promise<DashboardData> =>
  dedupeRequest(`dashboard:${page}`, async () => {
    const res = await axiosPrivate.get<DashboardApiResponse>(`/dashboard`, {
      params: { page },
    });
    return normalizeDashboard(res.data, page);
  });