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

export interface EventDetail extends ActivityEvent {
  source: string;
  inactivityDuration: string;
  caregiverNotes: string;
  isResolved: boolean;
}

export type HistoryStatus = "resolved" | "open";

export interface HistoryRecord {
  id: string;
  eventId: string;
  timestamp: number | null;
  time: string;
  title: string;
  category: string;
  status: HistoryStatus;
  fields: { label: string; value: string }[];
}

// GET /notifications
export type AlertType = "urgent" | "follow-up" | "update";

export interface NotificationAlert {
  id: string;
  patientId: string | null;
  patientName: string;
  patientCode: string;
  type: AlertType;
  read: boolean;
  eventId: string | null;
}

export interface NotificationSummary {
  all: number;
  unread: number;
  urgent: number;
  followUp: number;
  read: number;
}

export interface NotificationsData {
  alerts: NotificationAlert[];
  summary: NotificationSummary | null;
}