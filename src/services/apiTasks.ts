import { axiosPrivate } from "../lib/axios";
import { dedupeRequest } from "../lib/dedupeRequest";

interface TasksResponse {
  latestAlertDetections?: {
    id: string;
    detection?: string;
    status?: string;
    howLong?: string;
    isAssigned?: boolean;
    assignedToName?: string | null;
  }[];
  taskDetails?: {
    unassignedPatient?: string;
    eventLocation?: string;
    patientSafety?: string;
  };
  availableResponders?: {
    id: string;
    pic?: string;
    name?: string;
    professionalTitle?: string;
    dutyStatus?: string;
  }[];
}

export interface AlertDetection {
  id: string;
  detection: string;
  status: string;
  howLong: string;
  isAssigned: boolean;
  assignedToName: string;
}

export interface TaskDetails {
  unassignedPatient: string;
  eventLocation: string;
  patientSafety: string;
}

export interface Responder {
  id: string;
  pic: string;
  name: string;
  professionalTitle: string;
  dutyStatus: string;
}

export interface TasksData {
  alerts: AlertDetection[];
  taskDetails: TaskDetails;
  responders: Responder[];
}

export interface AssignTaskPayload {
  eventId: string;
  taskType: string;
  assignToUserId: string;
  priority: string;
  dueBy: string;
  assignmentMessage: string;
}

export const formatEnum = (value: string) => {
  const text = (value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
  return text ? text[0].toUpperCase() + text.slice(1) : "";
};

const toTasks = (raw: TasksResponse): TasksData => ({
  alerts: (raw.latestAlertDetections ?? []).map((alert) => ({
    id: alert.id,
    detection: alert.detection ?? "Alert detected",
    status: alert.status ?? "",
    howLong: alert.howLong ?? "",
    isAssigned: alert.isAssigned ?? false,
    assignedToName: alert.assignedToName ?? "",
  })),
  taskDetails: {
    unassignedPatient: raw.taskDetails?.unassignedPatient ?? "",
    eventLocation: raw.taskDetails?.eventLocation ?? "",
    patientSafety: raw.taskDetails?.patientSafety ?? "",
  },
  responders: (raw.availableResponders ?? []).map((responder) => ({
    id: responder.id,
    pic: responder.pic ?? "",
    name: responder.name ?? "Unnamed responder",
    professionalTitle: responder.professionalTitle ?? "",
    dutyStatus: responder.dutyStatus ?? "",
  })),
});

export const getTasks = (): Promise<TasksData> =>
  dedupeRequest("admin-tasks", async () => {
    const res = await axiosPrivate.get<TasksResponse>(`/admin/tasks`);
    return toTasks(res.data ?? {});
  });

export const assignTask = async (payload: AssignTaskPayload) => {
  await axiosPrivate.post(`/admin/tasks/assign`, payload);
};