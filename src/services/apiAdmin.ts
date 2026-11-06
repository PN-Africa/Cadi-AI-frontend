import { axiosPrivate } from "../lib/axios";
import { dedupeRequest } from "../lib/dedupeRequest";

const base = "/admin/dashboard";
const enc = encodeURIComponent;

export interface NewPatientPayload {
  personalInformation: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    emailAddress: string;
    homeAddress: string;
  };
  emergencyContact: { fullName: string; relationship: string; phoneNumber: string };
  care: {
    status: string;
    assignedCaregiverId: string;
    allergies: string;
    careNotes: string;
  };
}

export interface PatientEditPayload {
  patientDetails: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    emailAddress: string;
    phoneNumber: string;
    gender: string;
  };
  clinicalInformation: {
    medicalRecordNumber: string;
    primaryCarePhysician: string;
    careTeam: string;
    patientStatus: string;
    notes: string;
  };
}

export type PatientEditResponse = Partial<{
  [K in keyof PatientEditPayload]: Partial<PatientEditPayload[K]>;
}> & { patientIdCode?: string };

export interface Caregiver {
  id: string;
  fullName: string;
  role: string;
}

export const getCaregivers = (): Promise<Caregiver[]> =>
  dedupeRequest("admin-caregivers", async () => {
    const res = await axiosPrivate.get<Caregiver[]>(`${base}/caregivers-dropdown`);
    return Array.isArray(res.data) ? res.data : [];
  });

export const createPatient = async (payload: NewPatientPayload) => {
  await axiosPrivate.post(`${base}/patients`, payload);
};

export const getPatientEdit = (id: string): Promise<PatientEditResponse> =>
  dedupeRequest(`admin-patient-edit:${id}`, async () => {
    const res = await axiosPrivate.get<PatientEditResponse>(`${base}/patients/${enc(id)}/edit`);
    return res.data ?? {};
  });

export const updatePatient = async (id: string, payload: PatientEditPayload) => {
  await axiosPrivate.put(`${base}/patients/${enc(id)}`, payload);
};

export interface UserPayload {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phoneNumber: string;
  licenseNumber: string;
  accessLevel: string;
  department: string;
  assignedTeam: string;
  patientGroup: string;
  notes: string;
}

export type UserEditResponse = Partial<UserPayload> & { userIdCode?: string };


export const getUsers = (): Promise<Professional[]> => getProfessionals();

export const createUser = async (payload: UserPayload) => {
  await axiosPrivate.post(`${base}/users`, payload);
};

export const getUserEdit = (id: string): Promise<UserEditResponse> =>
  dedupeRequest(`admin-user-edit:${id}`, async () => {
    const res = await axiosPrivate.get<UserEditResponse>(`${base}/users/${enc(id)}/edit`);
    return res.data ?? {};
  });

export const updateUser = async (id: string, payload: UserPayload) => {
  await axiosPrivate.put(`${base}/users/${enc(id)}`, payload);
};

export interface Professional {
  id: string;
  name: string;
  role: string;
  availability: string;
  currentPatientsCount: number;
  action: string;
  pic?: string;
}

export const getProfessionals = (): Promise<Professional[]> =>
  dedupeRequest("admin-professionals", async () => {
    const res = await axiosPrivate.get<Professional[]>(`/admin/tasks/professionals`);
    return Array.isArray(res.data) ? res.data : [];
  });

export const assignProfessional = async (params: {
  taskId: string;
  professionalId: string;
  assignmentMessage: string;
}) => {
  await axiosPrivate.get(`/admin/tasks/assign-professional`, { params });
};