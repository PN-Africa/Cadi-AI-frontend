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

interface ApiMetrics {
  totalPatients?: number;
  emergencyPatients?: number;
  needsAttentionPatients?: number;
  normalPatients?: number;
  activeAlerts?: number;
}

interface ApiPriorityPatient {
  id: string;
  patientIdentifier?: string;
  status?: string;
  waitingTime?: string;
}

interface ApiPatient {
  id: string;
  name?: string;
  patientId?: string;
  patientCode?: string;
  currentCondition?: string;
  recentActivity?: string;
  status?: string;
}

interface DashboardApiResponse {
  metrics?: ApiMetrics;
  priorityPatients?: ApiPriorityPatient[];
  statusBreakdown?: {
    normal?: number;
    needsAttention?: number;
    emergency?: number;
  };
  patients?: ApiPatient[];

  summary?: {
    totalPatients?: number;
    normal?: number;
    needsAttention?: number;
    alerts?: number;
  };
  data?: ApiPatient[];
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

const num = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

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

const splitPatientIdentifier = (value?: string) => {
  const text = (value ?? "").trim();
  const index = text.lastIndexOf(" - ");

  if (index === -1) return { name: text, patientCode: "" };

  return {
    name: text.slice(0, index).trim(),
    patientCode: text.slice(index + 3).trim(),
  };
};

const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? "" : "s"}`;

// "7833 mins" -> "5 days", "1290 mins" -> "21 hours", "45 mins" -> "45 mins"
const formatElapsed = (value?: string): string => {
  const match = (value ?? "").match(/(\d+(?:\.\d+)?)\s*([a-z]*)/i);
  if (!match) return "—";

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  let minutes = amount;
  if (unit.startsWith("h")) minutes = amount * 60;
  else if (unit.startsWith("d")) minutes = amount * 1440;

  if (minutes < 1) return "Just now";
  if (minutes < 60) return plural(Math.floor(minutes), "min");
  if (minutes < 1440) return plural(Math.floor(minutes / 60), "hour");
  return plural(Math.floor(minutes / 1440), "day");
};

const mapPatients = (raw: DashboardApiResponse): DashboardPatient[] => {
  const fullList = raw.patients?.length ? raw.patients : raw.data;

  if (fullList?.length) {
    const waitingById = new Map(
      (raw.priorityPatients ?? []).map((p) => [p.id, p.waitingTime] as const)
    );

    return fullList.map((patient) => ({
      id: patient.id,
      name: patient.name ?? "Unnamed patient",
      patientCode: patient.patientId ?? patient.patientCode ?? "",
      recentActivity: formatElapsed(waitingById.get(patient.id) ?? patient.recentActivity),
      status: normalizeDashboardPatientStatus(patient.status),
    }));
  }

  // Current backend response only sends `priorityPatients`.
  return (raw.priorityPatients ?? []).map((patient) => {
    const { name, patientCode } = splitPatientIdentifier(patient.patientIdentifier);

    return {
      id: patient.id,
      name: name || "Unnamed patient",
      patientCode,
      recentActivity: formatElapsed(patient.waitingTime),
      status: normalizeDashboardPatientStatus(patient.status),
    };
  });
};

const normalizeDashboard = (raw: DashboardApiResponse, page: number): DashboardData => {
  const metrics = raw.metrics;
  const summary = raw.summary;

  const totalPatients = num(metrics?.totalPatients) ?? num(summary?.totalPatients) ?? 0;
  const needsAttention =
    num(metrics?.needsAttentionPatients) ?? num(summary?.needsAttention) ?? 0;
  const emergency = num(metrics?.emergencyPatients) ?? num(summary?.alerts) ?? 0;
  const normal =
    num(metrics?.normalPatients) ??
    num(summary?.normal) ??
    Math.max(totalPatients - needsAttention - emergency, 0);

  const statusBreakdown: DashboardStatusBreakdown = metrics
    ? { normal, needsAttention, emergency }
    : {
        normal: num(raw.statusBreakdown?.normal) ?? normal,
        needsAttention: num(raw.statusBreakdown?.needsAttention) ?? needsAttention,
        emergency: num(raw.statusBreakdown?.emergency) ?? emergency,
      };

  const patients = mapPatients(raw);

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
      totalEmergencyAlerts: emergency,
    },
    statusBreakdown,
    summary: { totalPatients, normal, needsAttention, alerts: emergency },
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