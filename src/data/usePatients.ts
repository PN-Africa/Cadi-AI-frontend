import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  getPatient,
  getPatientActivity,
  getPatientMonitoring,
  getPatients,
} from "../services/apiPatients";
import type {
  ActivityEvent,
  Patient,
  PatientMonitoring,
  PatientStatus,
  PatientSummary,
} from "./patientTypes";

const SHOW_MOCKS = import.meta.env.DEV || import.meta.env.VITE_SHOW_MOCKS === "true";

const isMockId = (id?: string) => !!id && id.startsWith("mock-");

const at = (daysAgo: number, hour: number, minute: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

// Every mock patient shares this timeline. "mock-inactivity" is the event
// shown in the Activity Details / Resolve Status / Event Resolved designs.
const mockEvents: ActivityEvent[] = [
  { id: "mock-inactivity", type: "INACTIVITY_DETECTION", label: "Inactivity Detected", description: "Inactivity was recorded.", timestamp: at(0, 10, 9), level: "needs attention" },
  { id: "mock-movement-1", type: "MOVEMENT_DETECTED", label: "Movement Detected", description: "Movement was recorded.", timestamp: at(0, 9, 54), level: "normal" },
  { id: "mock-movement-2", type: "MOVEMENT_DETECTED", label: "Movement Detected", description: "Movement was recorded.", timestamp: at(0, 9, 31), level: "normal" },
  { id: "mock-position", type: "POSITION_CHANGE", label: "Position Changed", description: "A position change was recorded.", timestamp: at(0, 9, 12), level: "normal" },
  { id: "mock-movement-3", type: "MOVEMENT_DETECTED", label: "Movement Detected", description: "Movement was recorded.", timestamp: at(0, 8, 48), level: "normal" },
  { id: "mock-movement-4", type: "MOVEMENT_DETECTED", label: "Movement Detected", description: "Movement was recorded.", timestamp: at(0, 8, 20), level: "normal" },
  { id: "mock-yesterday-1", type: "SUDDEN_MOVEMENT", label: "Sudden Movement", description: "A sudden movement was recorded.", timestamp: at(1, 17, 47), level: "needs attention" },
  { id: "mock-yesterday-2", type: "MOVEMENT_DETECTED", label: "Movement Detected", description: "Movement was recorded.", timestamp: at(1, 14, 30), level: "normal" },
];

const buildMockPatient = (
  id: string,
  patientCode: string,
  name: string,
  age: number,
  status: PatientStatus
): Patient => ({
  id,
  patientCode,
  name,
  age,
  status,
  lastActivity: mockEvents[0].timestamp,
  lastUpdated: new Date(Date.now() - 30 * 60000).toISOString(),
  stats: [
    { id: "heart-rate", label: "Heart Rate", detail: "Beats per minute", code: "HR", value: "76 bpm" },
    { id: "temperature", label: "Temperature", detail: "Celsius", code: "TEMP", value: "37.2°C" },
    { id: "blood-oxygen", label: "Blood Oxygen", detail: "Oxygen level", code: "BO", value: "97%" },
    { id: "movement", label: "Movements", detail: "Distance", code: "DIST", value: "2 km" },
  ],
  indicators: [
    { id: "INACTIVITY_DETECTION", label: "Inactivity Detected", minutesAgo: 30, level: "needs attention" },
    { id: "HIGH_TEMPERATURE", label: "High Temperature", minutesAgo: 60, level: "needs attention" },
    { id: "SUDDEN_MOVEMENT", label: "Sudden Movement", minutesAgo: 1440, level: "needs attention" },
    { id: "NORMAL_MOVEMENT", label: "Normal Movement", minutesAgo: 1440, level: "normal" },
    { id: "POSITION_CHANGE", label: "Position Changed", minutesAgo: 1440, level: "normal" },
  ],
});

const mockPatients: Patient[] = [
  buildMockPatient("mock-james-okarfor", "N2S458J", "James Okarfor", 71, "emergency"),
  buildMockPatient("mock-john-wick", "H3I847L", "John Wick", 48, "needs attention"),
  buildMockPatient("mock-white-esther", "W4H562K", "White Esther", 66, "normal"),
];

const mockLastActivity: Record<string, string> = {
  "mock-james-okarfor": "32min ago",
  "mock-john-wick": "2hrs ago",
  "mock-white-esther": "4hrs ago",
};

const mockSummaries: PatientSummary[] = mockPatients.map((patient) => ({
  id: patient.id,
  display: `${patient.name} (${patient.patientCode})`,
  status: patient.status,
  lastActivity: mockLastActivity[patient.id] ?? "",
}));

const mockMonitoring: PatientMonitoring = {
  charts: [],
  movementCalculation: "2 km today",
  status: "needs attention",
};

// ---------------------------------------------------------------------------
// Data hooks
// ---------------------------------------------------------------------------

type Failure = "none" | "not-found" | "error";

interface Settled<T> {
  requestKey: string;
  data: T | null;
  failure: Failure;
}

// Runs one request and reports loading / not-found / error. A new resourceKey
// (for example a different patient id) or reload() starts a fresh request, and
// results from older requests are ignored.
function useResource<T>(load: (() => Promise<T>) | null, resourceKey: string) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const requestKey = `${resourceKey}#${attempt}`;

  useEffect(() => {
    if (!load) return;

    let isCurrent = true;

    load()
      .then((data) => {
        if (isCurrent) setSettled({ requestKey, data, failure: "none" });
      })
      .catch((error: unknown) => {
        if (!isCurrent) return;

        console.log(error);

        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        setSettled({
          requestKey,
          data: null,
          failure: status === 404 || status === 400 ? "not-found" : "error",
        });
      });

    return () => {
      isCurrent = false;
    };
  }, [load, requestKey]);

  const current = settled !== null && settled.requestKey === requestKey ? settled : null;

  return {
    data: current?.data ?? null,
    isLoading: load !== null && current === null,
    isNotFound: current?.failure === "not-found",
    hasError: current?.failure === "error",
    reload: () => setAttempt((count) => count + 1),
  };
}

// Patient list: GET /patients
export const usePatients = () => {
  const { data, isLoading, hasError, reload } = useResource(getPatients, "patients");

  if (SHOW_MOCKS) {
    // Mock patients are listed first; a slow or failing API doesn't block them.
    return { patients: [...mockSummaries, ...(data ?? [])], isLoading: false, hasError: false, reload };
  }

  return { patients: data ?? [], isLoading, hasError, reload };
};

// One patient: GET /patients/{id}
export const usePatient = (id?: string) => {
  const isMock = isMockId(id);
  const load = useMemo(() => (id && !isMock ? () => getPatient(id) : null), [id, isMock]);
  const { data, isLoading, isNotFound, hasError, reload } = useResource(load, `patient:${id}`);

  if (isMock) {
    const patient = SHOW_MOCKS ? mockPatients.find((item) => item.id === id) ?? null : null;
    return { patient, isLoading: false, isNotFound: patient === null, hasError: false, reload };
  }

  return { patient: data, isLoading, isNotFound: isNotFound || !id, hasError, reload };
};

// GET /patients/{id}/monitoring
export const usePatientMonitoring = (id?: string) => {
  const isMock = isMockId(id);
  const load = useMemo(() => (id && !isMock ? () => getPatientMonitoring(id) : null), [id, isMock]);
  const { data, isLoading } = useResource(load, `monitoring:${id}`);

  if (isMock) {
    return { monitoring: SHOW_MOCKS ? mockMonitoring : null, isLoading: false };
  }

  return { monitoring: data, isLoading };
};

// GET /patients/{id}/activity
export const usePatientActivity = (id?: string) => {
  const isMock = isMockId(id);
  const load = useMemo(() => (id && !isMock ? () => getPatientActivity(id) : null), [id, isMock]);
  const { data, isLoading, hasError, reload } = useResource(load, `activity:${id}`);

  if (isMock) {
    return { events: SHOW_MOCKS ? mockEvents : [], isLoading: false, hasError: false, reload };
  }

  return { events: data ?? [], isLoading, hasError, reload };
};

// One event from a patient's timeline (there is no single-event endpoint, so
// it is looked up in the activity list).
export const usePatientEvent = (patientId?: string, eventId?: string) => {
  const { events, isLoading, hasError, reload } = usePatientActivity(patientId);
  const event = events.find((item) => item.id === eventId) ?? null;

  return { event, isLoading, hasError, reload };
};