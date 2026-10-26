import {
  getPatient,
  getPatientActivity,
  getPatientEvent,
  getPatientHistory,
  getPatientMonitoring,
  getPatients,
  isNotFoundError,
} from "../services/apiPatients";
import { useRequest } from "./useRequest";
import type {
  ActivityEvent,
  EventDetail,
  HistoryRecord,
  PatientSummary,
} from "./patientTypes";

// Stable empty arrays so consumers' useMemo/useEffect deps don't change every render.
const NO_PATIENTS: PatientSummary[] = [];
const NO_EVENTS: ActivityEvent[] = [];
const NO_HISTORY: HistoryRecord[] = [];

export const usePatients = () => {
  const { data, isLoading, error, reload } = useRequest("patients", getPatients);

  return {
    patients: data ?? NO_PATIENTS,
    isLoading,
    hasError: error != null,
    reload,
  };
};

export const usePatient = (id?: string) => {
  const { data, isLoading, error, reload, refresh } = useRequest(
    id ? `patient:${id}` : null,
    () => getPatient(id as string)
  );
  const notFound = error != null && isNotFoundError(error);

  return {
    patient: data,
    isLoading,
    isNotFound: notFound,
    hasError: error != null && !notFound,
    reload,
    refresh,
  };
};

export const usePatientMonitoring = (id?: string) => {
  const { data, isLoading, error, reload } = useRequest(
    id ? `monitoring:${id}` : null,
    () => getPatientMonitoring(id as string)
  );

  return { monitoring: data, isLoading, hasError: error != null, reload };
};

export const usePatientActivity = (id?: string) => {
  const { data, isLoading, error, reload } = useRequest(
    id ? `activity:${id}` : null,
    () => getPatientActivity(id as string)
  );

  return { events: data ?? NO_EVENTS, isLoading, hasError: error != null, reload };
};

export const usePatientEvent = (patientId?: string, eventId?: string) => {
  const { data, isLoading, error, reload } = useRequest<EventDetail>(
    patientId && eventId ? `event:${patientId}:${eventId}` : null,
    () => getPatientEvent(patientId as string, eventId as string)
  );

  // A 404 means "no such event" (event: null), not a load failure.
  return {
    event: data,
    isLoading,
    hasError: error != null && !isNotFoundError(error),
    reload,
  };
};

export const usePatientHistory = (patientId?: string) => {
  const { data, isLoading, error, reload } = useRequest(
    patientId ? `history:${patientId}` : null,
    () => getPatientHistory(patientId as string)
  );

  return { records: data ?? NO_HISTORY, isLoading, hasError: error != null, reload };
};