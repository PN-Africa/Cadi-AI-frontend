import { axiosPrivate } from "../lib/axios";
import { dedupeRequest } from "../lib/dedupeRequest";

export interface SettingsProfile {
  fullName: string;
  email: string;
  phone: string;
  careTeam: string;
}

export interface NotificationPreferences {
  pushNotifications: boolean;
  emailSummaries: boolean;
  smsAlerts: boolean;
}

export interface ActiveDevice {
  deviceName: string;
  lastActive: string;
  current: boolean;
}

export interface SettingsData {
  profile: SettingsProfile;
  notificationPreferences: NotificationPreferences;
  activeDevices: ActiveDevice[];
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// GET /settings
interface SettingsResponse {
  profile?: Partial<SettingsProfile>;
  notificationPreferences?: Partial<NotificationPreferences>;
  activeDevices?: Partial<ActiveDevice>[];
}

const toSettings = (raw: SettingsResponse): SettingsData => ({
  profile: {
    fullName: raw.profile?.fullName ?? "",
    email: raw.profile?.email ?? "",
    phone: raw.profile?.phone ?? "",
    careTeam: raw.profile?.careTeam ?? "",
  },
  notificationPreferences: {
    pushNotifications: raw.notificationPreferences?.pushNotifications ?? false,
    emailSummaries: raw.notificationPreferences?.emailSummaries ?? false,
    smsAlerts: raw.notificationPreferences?.smsAlerts ?? false,
  },
  activeDevices: (Array.isArray(raw.activeDevices) ? raw.activeDevices : []).map((device) => ({
    deviceName: device.deviceName ?? "Unknown device",
    lastActive: device.lastActive ?? "",
    current: device.current ?? false,
  })),
});

export const getSettings = (): Promise<SettingsData> =>
  dedupeRequest("settings", async () => {
    const res = await axiosPrivate.get<SettingsResponse>(`/settings`);
    return toSettings(res.data ?? {});
  });

// PUT /settings/profile
export const updateProfile = async (profile: SettingsProfile) => {
  await axiosPrivate.put(`/settings/profile`, profile);
};

// PATCH /settings/preferences
export const updatePreferences = async (preferences: NotificationPreferences) => {
  await axiosPrivate.patch(`/settings/preferences`, preferences);
};

// POST /settings/change-password
export const changePassword = async (payload: ChangePasswordPayload) => {
  await axiosPrivate.post(`/settings/change-password`, payload);
};