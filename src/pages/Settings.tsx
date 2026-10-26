import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LucideInfo } from "lucide-react";
import Loading from "../components/Loading";
import { useAuthStore } from "../auth/auth";
import { useRequest } from "../data/useRequest";
import { getErrorMessage } from "../services/apiPatients";
import {
  changePassword,
  getSettings,
  updatePreferences,
  updateProfile,
  type NotificationPreferences,
  type SettingsData,
  type SettingsProfile,
} from "../services/apiSettings";
import userIcon from "../assets/profile-2user.svg"


const cardClass = "rounded-xl border border-[#C6C6CD99] bg-white p-5 sm:p-6";
const inputClass =
  "w-full rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 text-[12px] sm:text-[13px] text-primary outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]";
const primaryButton =
  "cursor-pointer rounded-lg bg-[#2563EB] px-4 py-2.5 text-[13px] sm:text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60";
const outlineButton =
  "cursor-pointer rounded-lg border border-[#2563EB] bg-white px-4 py-2.5 text-[13px] sm:text-[14px] font-medium text-[#2563EB]";

const preferenceRows: {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}[] = [
  {
    key: "pushNotifications",
    title: "Push notifications",
    description: "Receive urgent alerts and reminders on your mobile device.",
  },
  {
    key: "emailSummaries",
    title: "Email summaries",
    description: "Get a daily digest of unread alerts and patient updates.",
  },
  {
    key: "smsAlerts",
    title: "SMS alerts",
    description: "Receive high-priority alerts when you are away from the app.",
  },
];

const securitySteps = [
  {
    title: "Update password",
    body: "Change your password every 90 days to keep your account secure.",
  },
  {
    title: "Review devices",
    body: "Confirm the browsers and devices currently signed in to your account.",
  },
  {
    title: "Two-factor authentication",
    body: "Add an extra verification step before signing in from a new device.",
  },
];

const syncedLabel = (syncedAt: number, now: number) => {
  const minutes = Math.max(0, Math.floor((now - syncedAt) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr${hours === 1 ? "" : "s"} ago`;
};

const Field = ({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <label htmlFor={id} className="text-[11px] sm:text-[12px] text-[#6B7C93]">
      {label}
    </label>
    {children}
    {error && (
      <p role="alert" className="text-[11px] text-[#DC2626]">
        {error}
      </p>
    )}
  </div>
);

const Toggle = ({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: () => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-wait disabled:opacity-70 ${
      checked ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
    }`}
  >
    <span
      aria-hidden="true"
      className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
);

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-xl bg-white p-5 sm:p-6"
      >
        <h2 className="text-[16px] sm:text-[18px] font-semibold text-primary">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

interface PasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordModal = ({ onClose }: { onClose: () => void }) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>();

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password updated");
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't update your password. Please try again."));
    }
  });

  return (
    <Modal title="Change password" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field id="currentPassword" label="Current password" error={errors.currentPassword?.message}>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            autoFocus
            className={inputClass}
            {...register("currentPassword", { required: "Enter your current password" })}
          />
        </Field>
        <Field id="newPassword" label="New password" error={errors.newPassword?.message}>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            {...register("newPassword", {
              required: "Enter a new password",
              minLength: { value: 8, message: "Use at least 8 characters" },
              validate: (value) =>
                value !== getValues("currentPassword") || "Choose a different password",
            })}
          />
        </Field>
        <Field id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.message}>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            {...register("confirmPassword", {
              required: "Confirm your new password",
              validate: (value) => value === getValues("newPassword") || "Passwords don't match",
            })}
          />
        </Field>

        <div className="mt-1 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={outlineButton}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className={primaryButton}>
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const DevicesModal = ({
  devices,
  onClose,
}: {
  devices: SettingsData["activeDevices"];
  onClose: () => void;
}) => (
  <Modal title="Signed-in devices" onClose={onClose}>
    {devices.length === 0 ? (
      <p className="text-[13px] text-[#6B7C93]">No active devices found.</p>
    ) : (
      <ul className="divide-y divide-[#C6C6CD99]">
        {devices.map((device, index) => {
          const when = new Date(device.lastActive);

          return (
            <li key={`${device.deviceName}-${index}`} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] sm:text-[14px] text-primary">{device.deviceName}</p>
                <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
                  {Number.isNaN(when.getTime())
                    ? "Last active unknown"
                    : `Last active ${when.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`}
                </p>
              </div>
              {device.current && (
                <span className="shrink-0 rounded-md bg-[#E0EDFF] px-2 py-0.5 text-[11px] sm:text-[12px] font-medium text-[#1D4ED8]">
                  This device
                </span>
              )}
            </li>
          );
        })}
      </ul>
    )}
    <div className="mt-4 flex justify-end">
      <button type="button" onClick={onClose} className={outlineButton}>
        Close
      </button>
    </div>
  </Modal>
);

const SettingsContent = ({ initial }: { initial: SettingsData }) => {
  const user = useAuthStore((state) => state.user);
  const roleLabel = user?.role
    ?.trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  const [displayName, setDisplayName] = useState(initial.profile.fullName);
  const [preferences, setPreferences] = useState(initial.notificationPreferences);
  const [savingPreference, setSavingPreference] = useState<keyof NotificationPreferences | null>(null);
  const [dialog, setDialog] = useState<"password" | "devices" | null>(null);
  const [syncedAt, setSyncedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsProfile>({ defaultValues: initial.profile });

  const onSaveProfile = handleSubmit(async (values) => {
    const next: SettingsProfile = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      careTeam: values.careTeam.trim(),
    };

    try {
      await updateProfile(next);
      reset(next);
      setDisplayName(next.fullName);
      setSyncedAt(Date.now());
      setNow(Date.now());
      toast.success("Profile saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't save your profile. Please try again."));
    }
  });

  const togglePreference = async (key: keyof NotificationPreferences) => {
    if (savingPreference) return;

    const previous = preferences;
    const next = { ...preferences, [key]: !preferences[key] };

    setPreferences(next);
    setSavingPreference(key);

    try {
      await updatePreferences(next);
    } catch (error) {
      setPreferences(previous);
      toast.error(getErrorMessage(error, "We couldn't update your notification preferences."));
    } finally {
      setSavingPreference(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[20px] sm:text-[24px] lg:text-[28px] font-medium text-primary">Settings</h1>
          <p className="mt-1 text-[12px] sm:text-[13px] text-[#6B7C93]">
            Manage your profile, preferences, and notification setup.
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-[#6B7C93] sm:pt-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[#2563EB]" />
          Profile synced {syncedLabel(syncedAt, now)}
        </p>
      </div>

      <section className="flex items-center justify-between gap-4 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#93C5FD] bg-white text-[#2563EB]"
          >
            <img src={userIcon} alt="User" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-2 text-primary">
              <span className="truncate text-[14px] sm:text-[15px] font-medium">{displayName}</span>
              {roleLabel && <span className="text-[11px] sm:text-[12px] text-[#6B7C93]">{roleLabel}</span>}
            </p>
            <p className="mt-0.5 text-[12px] sm:text-[13px] text-primary">
              Manage your account, notification preferences, and care team access from one place.
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[12px] sm:text-[13px] font-medium text-[#2563EB]">Active</span>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">
          <form onSubmit={onSaveProfile} noValidate className={cardClass}>
            <h2 className="text-[16px] sm:text-[18px] font-semibold text-primary">Profile details</h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="fullName" label="Full name" error={errors.fullName?.message}>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className={inputClass}
                  {...register("fullName", { required: "Enter your full name" })}
                />
              </Field>
              <Field id="email" label="Work email" error={errors.email?.message}>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={inputClass}
                  {...register("email", {
                    required: "Enter your work email",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" },
                  })}
                />
              </Field>
              <Field id="phone" label="Phone number" error={errors.phone?.message}>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className={inputClass}
                  {...register("phone", {
                    pattern: { value: /^\+?[\d\s()-]{7,20}$/, message: "Enter a valid phone number" },
                  })}
                />
              </Field>
              <Field id="careTeam" label="Care team" error={errors.careTeam?.message}>
                <input id="careTeam" type="text" className={inputClass} {...register("careTeam")} />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">Changes are saved automatically.</p>
              <button type="submit" disabled={isSubmitting} className={primaryButton}>
                {isSubmitting ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>

          <section className={cardClass}>
            <h2 className="text-[16px] sm:text-[18px] font-semibold text-primary">Notification preferences</h2>

            <ul className="mt-5 flex flex-col gap-4">
              {preferenceRows.map((row) => (
                <li key={row.key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13px] sm:text-[14px] font-medium text-primary">{row.title}</p>
                    <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">{row.description}</p>
                  </div>
                  <Toggle
                    label={row.title}
                    checked={preferences[row.key]}
                    disabled={savingPreference === row.key}
                    onChange={() => togglePreference(row.key)}
                  />
                </li>
              ))}
            </ul>
          </section>

          <div className="text-[11px] sm:text-[12px] text-[#6B7C93]">
            <p className="flex items-start gap-2">
              <LucideInfo className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              Changes to notification preferences and account access may take a few minutes to apply
              across all devices.
            </p>
            <p className="mt-0.5 pl-[22px]">
              Need help with account access or notification setup? Contact your care team administrator.
            </p>
          </div>
        </div>

        <aside className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-5 sm:p-6">
          <h2 className="text-[16px] sm:text-[18px] font-semibold text-primary">Account security</h2>

          <ol className="mt-5 flex flex-col gap-4">
            {securitySteps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3">
                <span className="text-[11px] sm:text-[12px] text-[#6B7C93]">{index + 1}</span>
                <div>
                  <p className="text-[13px] sm:text-[14px] font-medium text-primary">{step.title}</p>
                  <p className="mt-0.5 text-[11px] sm:text-[12px] text-[#6B7C93]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex flex-col gap-2">
            <button type="button" onClick={() => setDialog("password")} className={`w-full ${primaryButton}`}>
              Change password
            </button>
            <button type="button" onClick={() => setDialog("devices")} className={`w-full ${outlineButton}`}>
              Review devices
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] sm:text-[12px] text-[#6B7C93]">
            Keep your recovery email and phone number up to date.
          </p>
        </aside>
      </div>

      {dialog === "password" && <PasswordModal onClose={() => setDialog(null)} />}
      {dialog === "devices" && (
        <DevicesModal devices={initial.activeDevices} onClose={() => setDialog(null)} />
      )}
    </div>
  );
};

const Settings = () => {
  const { data, isLoading, error, reload } = useRequest("settings", getSettings);

  if (isLoading) {
    return <Loading variant="spinner" label="Loading settings" />;
  }

  if (error != null || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-[#C6C6CD99] bg-white p-8 text-center sm:p-10"
        >
          <p className="font-semibold text-[16px] sm:text-[18px] text-primary">
            We couldn't load your settings
          </p>
          <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">
            Check your connection, then try again.
          </p>
          <button
            type="button"
            onClick={reload}
            className="mt-1 cursor-pointer rounded-md border-[1.5px] border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <SettingsContent initial={data} />;
};

export default Settings;