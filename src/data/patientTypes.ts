export type PatientStatus = "normal" | "needs attention" | "emergency";

export const statusLabels: Record<PatientStatus, string> = {
  normal: "Normal",
  "needs attention": "Needs Attention",
  emergency: "Emergency",
};

export interface PatientSummary {
  id: string;
  display: string;
  status: PatientStatus;
  lastActivity: string;
}

export type PatientStatId = "heart-rate" | "temperature" | "blood-oxygen" | "movement";

export interface PatientStat {
  id: PatientStatId;
  label: string;
  detail: string;
  code: string;
  value: string;
}

export interface StatusIndicator {
  id: string;
  label: string;
  minutesAgo: number | null;
  level: PatientStatus;
}

export interface PatientActivityItem {
  id: string;
  label: string;
  time: string;
  day: string;
  level: PatientStatus;
}

export interface Patient {
  id: string;
  patientCode: string;
  name: string;
  age: number | null;
  status: PatientStatus;
  lastUpdated: string;
  lastActivity: string | null;
  stats: PatientStat[];
  indicators: StatusIndicator[];
  activity?: PatientActivityItem[];
}

export interface MonitoringPoint {
  timestamp: string;
  heartRate: number;
  bloodOxygen: number;
  temperature: number;
}

export interface PatientMonitoring {
  charts: MonitoringPoint[];
  movementCalculation: string;
  status: PatientStatus;
}

export interface ActivityEvent {
  id: string;
  type: string;
  label: string;
  description: string;
  timestamp: string;
  level: PatientStatus;
}