import { isAxiosError } from "axios";
import { axiosPrivate } from "../lib/axios";
import { dedupeRequest } from "../lib/dedupeRequest";
import type {
  ActivityEvent,
  EventDetail,
  HistoryRecord,
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

export interface ActivityTimelineResponse {
  id: string;
  detection: string;
  time: string;
}

export interface EventDetailResponse {
  id: string;
  detectionName: string;
  time: string;
  eventOverview?: {
    recordedAt?: string;
    inactivityDuration?: string;
    source?: string;
  };
  caregiverNotes?: string;
  resolvedStatus?: string;
}

export interface HistoryItemResponse {
  id: string;
  timeAndRecordingIndication: string;
  columnDetails?: {
    detectionNameAndSource?: string;
    resolutionReasonsAndLastChecked?: string;
    resolutionNotesAndAlertType?: string;
    alertSource?: string;
    inactivityDuration?: string;
    statusIndication?: string;
  };
}

export interface ResolveEventPayload {
  resolutionReason: string;
  resolutionNotes: string;
  updatedPatientStatus: string;
  isDraft: boolean;
}

export const isNotFoundError = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 404;

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

const normalizeStatus = (value?: string): PatientStatus => {
  const key = (value ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (key === "NORMAL") return "normal";
  if (key === "EMERGENCY") return "emergency";
  return "needs attention";
};

export const toApiStatus = (status: PatientStatus) =>
  status.toUpperCase().replace(/\s+/g, "_");

const eventTypes: Record<string, { label: string; level: PatientStatus }> = {
  INACTIVITY_DETECTION: { label: "Inactivity Detected", level: "needs attention" },
  HIGH_TEMPERATURE: { label: "High Temperature", level: "needs attention" },
  SUDDEN_MOVEMENT: { label: "Sudden Movement", level: "needs attention" },
  NORMAL_MOVEMENT: { label: "Normal Movement", level: "normal" },
  MOVEMENT_DETECTED: { label: "Movement Detected", level: "normal" },
  POSITION_CHANGE: { label: "Position Changed", level: "normal" },
};

const detectionAliases: Record<string, string> = {
  INACTIVITY_DETECTED: "INACTIVITY_DETECTION",
  HIGH_TEMPERATURE_DETECTED: "HIGH_TEMPERATURE",
  SUDDEN_MOVEMENT_DETECTED: "SUDDEN_MOVEMENT",
  NORMAL_MOVEMENT_DETECTED: "NORMAL_MOVEMENT",
  POSITION_CHANGED: "POSITION_CHANGE",
};

const detectionToType = (name: string) => {
  const key = (name ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  return detectionAliases[key] ?? key;
};

const describeDetection = (name: string) => {
  const type = detectionToType(name);
  const known = eventTypes[type];

  return {
    type,
    label: known?.label ?? (name?.trim() || "Event"),
    level: known?.level ?? ("needs attention" as PatientStatus),
  };
};

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
    lastActivity: raw.minsSinceEvents?.inactivityDetectedMins === 0 ? "Just now" : `${raw.minsSinceEvents?.inactivityDetectedMins ?? "—"} min ago`,
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

const toActivityEvent = (raw: ActivityTimelineResponse): ActivityEvent => {
  const { type, label, level } = describeDetection(raw.detection);

  return {
    id: raw.id,
    type,
    label,
    description: "",
    timestamp: raw.time,
    level,
  };
};

const toEventDetail = (raw: EventDetailResponse): EventDetail => {
  const { type, label, level } = describeDetection(raw.detectionName);

  return {
    id: raw.id,
    type,
    label,
    description: raw.caregiverNotes ?? "",
    timestamp: raw.time,
    level,
    source: raw.eventOverview?.source ?? "",
    inactivityDuration: raw.eventOverview?.inactivityDuration ?? "",
    caregiverNotes: raw.caregiverNotes ?? "",
    isResolved: (raw.resolvedStatus ?? "").trim().toUpperCase() === "RESOLVED",
  };
};

const splitOnce = (value: string | undefined, separator = " - "): [string, string] => {
  const text = (value ?? "").trim();
  const index = text.indexOf(separator);
  if (index === -1) return [text, ""];
  return [text.slice(0, index).trim(), text.slice(index + separator.length).trim()];
};

const months = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const parseRecordedAt = (date: string, time: string): number | null => {
  const d = /([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/.exec(date);
  const t = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(time);
  if (!d) return null;

  const month = months.indexOf(d[1].toLowerCase());
  if (month === -1) return null;

  let hours = t ? Number(t[1]) : 0;
  const minutes = t ? Number(t[2]) : 0;
  const meridiem = t?.[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return new Date(Number(d[3]), month, Number(d[2]), hours, minutes).getTime();
};

const toHistoryRecord = (raw: HistoryItemResponse): HistoryRecord => {
  const details = raw.columnDetails ?? {};

  const recorded = (raw.timeAndRecordingIndication ?? "").replace(/\s*\([^)]*\)\s*$/, "");
  const [date, time] = splitOnce(recorded);

  const [title, source] = splitOnce(details.detectionNameAndSource);
  const [reason, checked] = splitOnce(details.resolutionReasonsAndLastChecked);
  const [notes, alertType] = splitOnce(details.resolutionNotesAndAlertType);
  const lastChecked = checked.replace(/^last checked\s*/i, "");

  const status = (details.statusIndication ?? "").trim().toUpperCase() === "RESOLVED" ? "resolved" : "open";
  const fallback = (value?: string) => value?.trim() || "Not provided";

  return {
    id: raw.id,
    eventId: raw.id,
    timestamp: parseRecordedAt(date, time),
    time: time || date,
    title: title || "Event",
    category: alertType || source || "Activity alert",
    status,
    fields:
      status === "resolved"
        ? [
            { label: "Inactivity duration", value: fallback(details.inactivityDuration) },
            { label: "Resolution reason", value: fallback(reason) },
            { label: "Resolution notes", value: fallback(notes) },
          ]
        : [
            { label: "Alert source", value: fallback(details.alertSource || source) },
            { label: "Last checked", value: fallback(lastChecked) },
            { label: "Notes", value: fallback(notes) },
          ],
  };
};

export const getPatients = (): Promise<PatientSummary[]> =>
  dedupeRequest("patients", async () => {
    const res = await axiosPrivate.get<PatientListItemResponse[]>(`/patients`);
    return (Array.isArray(res.data) ? res.data : []).map(toPatientSummary);
  });

export const getPatient = (id: string): Promise<Patient> =>
  dedupeRequest(`patient:${id}`, async () => {
    const res = await axiosPrivate.get<PatientDetailResponse>(
      `/patients/${encodeURIComponent(id)}`
    );
    return toPatient(res.data);
  });

export const getPatientMonitoring = (id: string): Promise<PatientMonitoring> =>
  dedupeRequest(`monitoring:${id}`, async () => {
    const res = await axiosPrivate.get<PatientMonitoringResponse>(
      `/patients/${encodeURIComponent(id)}/monitoring`
    );
    return toMonitoring(res.data);
  });

export const getPatientActivity = (id: string): Promise<ActivityEvent[]> =>
  dedupeRequest(`activity:${id}`, async () => {
    const res = await axiosPrivate.get<ActivityTimelineResponse[]>(
      `/patients/${encodeURIComponent(id)}/activity-timeline`
    );

    // newest first
    return (Array.isArray(res.data) ? res.data : [])
      .map(toActivityEvent)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

export const getPatientEvent = (patientId: string, eventId: string): Promise<EventDetail> =>
  dedupeRequest(`event:${patientId}:${eventId}`, async () => {
    const res = await axiosPrivate.get<EventDetailResponse>(
      `/patients/${encodeURIComponent(patientId)}/events/${encodeURIComponent(eventId)}`
    );
    return toEventDetail(res.data);
  });

export const getPatientHistory = (id: string): Promise<HistoryRecord[]> =>
  dedupeRequest(`history:${id}`, async () => {
    const res = await axiosPrivate.get<HistoryItemResponse[]>(
      `/patients/${encodeURIComponent(id)}/history`
    );
    return (Array.isArray(res.data) ? res.data : []).map(toHistoryRecord);
  });

// POST - caregiver only
export const addEventNote = async (patientId: string, eventId: string, note: string) => {
  await axiosPrivate.post(
    `/patients/${encodeURIComponent(patientId)}/events/${encodeURIComponent(eventId)}/note`,
    { note }
  );
};

export const resolveEvent = async (eventId: string, payload: ResolveEventPayload) => {
  await axiosPrivate.patch(`/patients/events/${encodeURIComponent(eventId)}/resolve`, payload);
};