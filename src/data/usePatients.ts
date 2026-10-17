import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  getPatient,
  getPatientActivity,
  getPatientMonitoring,
  getPatients,
} from "../services/apiPatients";

type Failure = "none" | "not-found" | "error";

interface Settled<T> {
  requestKey: string;
  data: T | null;
  failure: Failure;
}

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

export const usePatients = () => {
  const { data, isLoading, hasError, reload } = useResource(getPatients, "patients");

  return { patients: data ?? [], isLoading, hasError, reload };
};

export const usePatient = (id?: string) => {
  const load = useMemo(() => (id ? () => getPatient(id) : null), [id]);
  const { data, isLoading, isNotFound, hasError, reload } = useResource(load, `patient:${id}`);

  return { patient: data, isLoading, isNotFound: isNotFound || !id, hasError, reload };
};

export const usePatientMonitoring = (id?: string) => {
  const load = useMemo(() => (id ? () => getPatientMonitoring(id) : null), [id]);
  const { data, isLoading } = useResource(load, `monitoring:${id}`);

  return { monitoring: data, isLoading };
};

export const usePatientActivity = (id?: string) => {
  const load = useMemo(() => (id ? () => getPatientActivity(id) : null), [id]);
  const { data, isLoading, hasError, reload } = useResource(load, `activity:${id}`);

  return { events: data ?? [], isLoading, hasError, reload };
};