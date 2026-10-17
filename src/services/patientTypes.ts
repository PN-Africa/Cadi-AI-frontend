
export type PatientStatus = "normal" | "needs attention" | "emergency";

export const statusLabels: Record<PatientStatus, string> = {
  normal: "Normal",
  "needs attention": "Needs Attention",
  emergency: "Emergency",
};

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
  since: string;
  level: PatientStatus;
}

export type ActivityDay = "today" | "yesterday";

export interface ActivityEvent {
  id: string;
  label: string;
  time: string;
  day: ActivityDay;
  level: PatientStatus;
}

export interface Patient {
  id: string;
  patientCode: string;
  name: string;
  age: number;
  avatarUrl?: string;
  status: PatientStatus;
  lastActivity: string;
  lastUpdated: string;
  stats: PatientStat[];
  indicators: StatusIndicator[];
  activity: ActivityEvent[];
}