import { axiosPrivate } from "../lib/axios";

export type PatientStatus = "Normal" | "Needs Attention" | "Alert";
export type DashboardPatientStatus = "Normal" | "Needs Attention" | "Emergency";

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
  patientId: string;
  currentCondition: string;
  status: DashboardPatientStatus;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  statusBreakdown: DashboardStatusBreakdown;
  patients: DashboardPatient[];
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

interface DashboardApiResponse {
  metrics: DashboardMetrics;
  statusBreakdown: DashboardStatusBreakdown;
  patients: Array<{
    id: string;
    name: string;
    patientId: string;
    currentCondition: string;
    status: string;
  }>;
}

const normalizeStatus = (value: string): DashboardPatientStatus => {
  const key = value.trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (key === "NORMAL") return "Normal";
  if (key === "EMERGENCY" || key === "ALERT") return "Emergency";
  return "Needs Attention";
};

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await axiosPrivate.get<DashboardApiResponse>("/dashboard");
  const raw = response.data;

  return {
    metrics: raw.metrics,
    statusBreakdown: raw.statusBreakdown,
    patients: raw.patients.map((patient) => ({
      ...patient,
      status: normalizeStatus(patient.status),
    })),
  };
};
