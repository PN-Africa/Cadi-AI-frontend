import { getNotifications } from "../services/apiNotifications";
import { useRequest } from "./useRequest";
import type { NotificationAlert } from "./patientTypes";

const NO_ALERTS: NotificationAlert[] = [];

export const useNotifications = () => {
  const { data, isLoading, error, reload } = useRequest("notifications", getNotifications);

  return {
    alerts: data?.alerts ?? NO_ALERTS,
    summary: data?.summary ?? null,
    isLoading,
    hasError: error != null,
    reload,
  };
};