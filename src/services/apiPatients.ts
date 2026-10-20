import { axiosPrivate } from "../lib/axios";
import type {
  ActivityEvent,
  MonitoringPoint,
  Patient,
  PatientMonitoring,
  PatientStat,
  PatientStatus,
  PatientSummary,
  StatusIndicator,
} from "../data/patientTypes";

export interface PatientListItemResponse {
  id: string;
  patientDisplay: string;
  status: string;
  lastActivity: string;
}

export interface PatientDetailResponse {
  id: string;
  name: string;
  patientIdCode: string;
  age: number;
  status: string;
  lastUpdated: string;
  lastActivity: string;
  heartRate: number;
  bloodOxygen: number;
  temperature: number;
  movementKm: number;
  minsSinceEvents: {
    inactivityDetectedMins: number | null;
    highTemperatureMins: number | null;
    suddenMovementMins: number | null;
    normalMovementMins: number | null;
    positionChangeMins: number | null;
  };
}

export interface PatientMonitoringResponse {
  charts: {
    timestamp: string;
    heartRate: number;
    bloodOxygen: number;
    temperature: number;
  }[];
  movementCalculation: string;
  status: string;
}

export interface PatientActivityResponse {
  eventType: string;
  description: string;
  timestamp: string;
}

const normalizeStatus = (value?: string): PatientStatus => {
  const key = (value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (key === "NORMAL") return "normal";
  if (key === "EMERGENCY") return "emergency";
  return "needs attention";
};

const eventTypes: Record<string, { label: string; level: PatientStatus }> = {
  INACTIVITY_DETECTION: { label: "Inactivity Detected", level: "needs attention" },
  HIGH_TEMPERATURE: { label: "High Temperature", level: "needs attention" },
  SUDDEN_MOVEMENT: { label: "Sudden Movement", level: "needs attention" },
  NORMAL_MOVEMENT: { label: "Normal Movement", level: "normal" },
  MOVEMENT_DETECTED: { label: "Movement Detected", level: "normal" },
  POSITION_CHANGE: { label: "Position Changed", level: "normal" },
};

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

const describeEventType = (type: string) =>
  eventTypes[type] ?? { label: titleCase(type), level: "needs attention" as PatientStatus };

const formatMetric = (value: number | null | undefined, suffix: string) =>
  value === null || value === undefined || Number.isNaN(value) ? "—" : `${value}${suffix}`;

const indicatorFields = [
  ["inactivityDetectedMins", "INACTIVITY_DETECTION"],
  ["highTemperatureMins", "HIGH_TEMPERATURE"],
  ["suddenMovementMins", "SUDDEN_MOVEMENT"],
  ["normalMovementMins", "NORMAL_MOVEMENT"],
  ["positionChangeMins", "POSITION_CHANGE"],
] as const;

const toPatientSummary = (raw: PatientListItemResponse): PatientSummary => ({
  id: raw.id,
  display: raw.patientDisplay,
  status: normalizeStatus(raw.status),
  lastActivity: raw.lastActivity,
});

const toPatient = (raw: PatientDetailResponse): Patient => {
  const stats: PatientStat[] = [
    {
      id: "heart-rate",
      label: "Heart Rate",
      detail: "Beats per minute",
      code: "HR",
      value: formatMetric(raw.heartRate, " bpm"),
    },
    {
      id: "temperature",
      label: "Temperature",
      detail: "Celsius",
      code: "TEMP",
      value: formatMetric(raw.temperature, "°C"),
    },
    {
      id: "blood-oxygen",
      label: "Blood Oxygen",
      detail: "Oxygen level",
      code: "BO",
      value: formatMetric(raw.bloodOxygen, "%"),
    },
    {
      id: "movement",
      label: "Movements",
      detail: "Distance",
      code: "DIST",
      value: formatMetric(raw.movementKm, " km"),
    },
  ];

  const indicators: StatusIndicator[] = indicatorFields.map(([field, type]) => ({
    id: type,
    label: eventTypes[type].label,
    minutesAgo: raw.minsSinceEvents?.[field] ?? null,
    level: eventTypes[type].level,
  }));

  return {
    id: raw.id,
    patientCode: raw.patientIdCode,
    name: raw.name,
    age: raw.age ?? null,
    lastActivity: raw.lastActivity,
    status: normalizeStatus(raw.status),
    lastUpdated: raw.lastUpdated,
    stats,
    indicators,
  };
};

const toMonitoring = (raw: PatientMonitoringResponse): PatientMonitoring => ({
  charts: (raw.charts ?? []).map(
    (point): MonitoringPoint => ({
      timestamp: point.timestamp,
      heartRate: point.heartRate,
      bloodOxygen: point.bloodOxygen,
      temperature: point.temperature,
    })
  ),
  movementCalculation: raw.movementCalculation ?? "",
  status: normalizeStatus(raw.status),
});

const toActivityEvent = (raw: PatientActivityResponse, index: number): ActivityEvent => {
  const { label, level } = describeEventType(raw.eventType);

  return {
    id: `${raw.timestamp}|${raw.eventType}|${index}`,
    type: raw.eventType,
    label,
    description: raw.description ?? "",
    timestamp: raw.timestamp,
    level,
  };
};

export const getPatients = async (): Promise<PatientSummary[]> => {
  const res = await axiosPrivate.get<PatientListItemResponse[]>(`/patients`);
  return (Array.isArray(res.data) ? res.data : []).map(toPatientSummary);
};

export const getPatient = async (id: string): Promise<Patient> => {
  const res = await axiosPrivate.get<PatientDetailResponse>(
    `/patients/${encodeURIComponent(id)}`
  );
  return toPatient(res.data);
};

export const getPatientMonitoring = async (id: string): Promise<PatientMonitoring> => {
  const res = await axiosPrivate.get<PatientMonitoringResponse>(
    `/patients/${encodeURIComponent(id)}/monitoring`
  );
  return toMonitoring(res.data);
};

export const getPatientActivity = async (id: string): Promise<ActivityEvent[]> => {
  const res = await axiosPrivate.get<PatientActivityResponse[]>(
    `/patients/${encodeURIComponent(id)}/activity`
  );

  // Newest first
  return (Array.isArray(res.data) ? res.data : [])
    .map(toActivityEvent)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};