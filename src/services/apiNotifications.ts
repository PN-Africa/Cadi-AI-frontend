import { axiosPrivate } from "../lib/axios";
import { dedupeRequest } from "../lib/dedupeRequest";
import { getPatients } from "./apiPatients";
import type {
  AlertType,
  NotificationAlert,
  NotificationsData,
} from "../data/patientTypes";

// GET /notifications
export interface NotificationsResponse {
  summary?: {
    numberOfAlerts?: number;
    numberOfUnread?: number;
    numberOfUrgent?: number;
    numberOfFollowUp?: number;
    numberOfRead?: number;
  };
  notifications?: {
    id: string;
    patientNameAndId: string;
    alertType: string;
    status: string;
    reviewAlertAction: string;
  }[];
}

const normalizeAlertType = (value?: string): AlertType => {
  const key = (value ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (key === "urgent") return "urgent";
  if (key === "follow-up" || key === "followup") return "follow-up";
  return "update";
};

// "Jane Doe - PAT-1001" -> { name: "Jane Doe", code: "PAT-1001" }
const splitPatient = (value?: string) => {
  const text = (value ?? "").trim();
  const index = text.lastIndexOf(" - ");
  if (index === -1) return { name: text, code: "" };
  return { name: text.slice(0, index).trim(), code: text.slice(index + 3).trim() };
};

// "Jane Doe (PAT-1001)" -> "PAT-1001"
const codeFromDisplay = (display: string) => /\(([^)]+)\)\s*$/.exec(display)?.[1]?.trim() ?? "";

// "/patients/events/<id>" -> "<id>"
const eventIdFromAction = (action?: string) => {
  const last = (action ?? "").split("?")[0].split("/").filter(Boolean).pop();
  if (!last) return null;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
};

export const getNotifications = (): Promise<NotificationsData> =>
  dedupeRequest("notifications", async () => {
    // The notification only carries the patient's code, so the patient list
    // (already cached/deduped by the list page) is used to find the patient id.
    const [res, patients] = await Promise.all([
      axiosPrivate.get<NotificationsResponse>(`/notifications`),
      getPatients().catch(() => []),
    ]);

    const idByCode = new Map(patients.map((patient) => [codeFromDisplay(patient.display), patient.id]));

    const alerts: NotificationAlert[] = (res.data?.notifications ?? []).map((raw) => {
      const { name, code } = splitPatient(raw.patientNameAndId);

      return {
        id: raw.id,
        patientId: idByCode.get(code) ?? null,
        patientName: name,
        patientCode: code,
        type: normalizeAlertType(raw.alertType),
        read: (raw.status ?? "").trim().toLowerCase() !== "unread",
        eventId: eventIdFromAction(raw.reviewAlertAction),
      };
    });

    const summary = res.data?.summary;

    return {
      alerts,
      summary: summary
        ? {
            all: summary.numberOfAlerts ?? alerts.length,
            unread: summary.numberOfUnread ?? alerts.filter((alert) => !alert.read).length,
            urgent: summary.numberOfUrgent ?? alerts.filter((alert) => alert.type === "urgent").length,
            followUp:
              summary.numberOfFollowUp ?? alerts.filter((alert) => alert.type === "follow-up").length,
            read: summary.numberOfRead ?? alerts.filter((alert) => alert.read).length,
          }
        : null,
    };
  });