import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LucideArrowLeft, LucideChevronDown, LucideClock } from "lucide-react";
import { assignProfessional, getProfessionals, type Professional } from "../services/apiAdmin";
import { formatEnum } from "../services/apiTasks";
import { getErrorMessage } from "../services/apiPatients";
import { useAuthStore } from "../auth/auth";
import { isAdminRole } from "../auth/roles";
import { LoadState, useLoad } from "../components/AdminForm";
import user from "../assets/profile-2user-active.svg"

const addBtn =
  "h-10 rounded-lg bg-[#2563EB] px-5 text-[13px] font-medium leading-10 text-white hover:bg-[#1D4ED8]";

const badgeTone: Record<string, string> = {
  ON_DUTY: "bg-[#DBEAFE] text-[#1D4ED8]",
  AVAILABLE: "bg-[#DCFCE7] text-[#15803D]",
  BUSY: "bg-[#FEF3C7] text-[#B45309]",
};

const key = (v: string) => (v ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => w && !/^(dr\.?|nurse)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const Avatar = ({ p }: { p: Professional }) =>
  p.pic ? (
    <img src={p.pic} alt="" className="size-9 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8EEFB] text-[11px] font-medium text-[#1D4ED8]">
      {initials(p.name)}
    </span>
  );

const Filter = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="relative">
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 cursor-pointer appearance-none rounded-md border border-[#C6C6CD99] bg-white pl-3 pr-7 text-[12px] text-primary outline-none focus:border-[#2563EB]"
    >
      <option value="">All {label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <LucideChevronDown
      aria-hidden="true"
      className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-primary"
    />
  </div>
);

const Users = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const taskId = params.get("taskId") ?? "";
  const isAdmin = isAdminRole(useAuthStore((s) => s.user?.role));
  const { data: all, error, loading } = useLoad(getProfessionals, []);
  const [role, setRole] = useState("");
  const [availability, setAvailability] = useState("");
  const [busyId, setBusyId] = useState("");
  const [assignError, setAssignError] = useState("");

  const list = all ?? [];
  const shown = list.filter(
    (p) => (!role || key(p.role) === role) && (!availability || key(p.availability) === availability)
  );
  const canAssign = (p: Professional) => !["BUSY", "UNAVAILABLE"].includes(key(p.availability));
  const uniq = (pick: (p: Professional) => string) =>
    [...new Set(list.map((p) => key(pick(p))).filter(Boolean))].map((v) => ({ value: v, label: formatEnum(v) }));

  const assign = async (p: Professional) => {
    if (!taskId) {
      setAssignError("Open this page from a task to assign a professional.");
      return;
    }
    setBusyId(p.id);
    setAssignError("");
    try {
      await assignProfessional({ taskId, professionalId: p.id, assignmentMessage: `Assigned to ${p.name}.` });
      navigate("/tasks");
    } catch (e) {
      setAssignError(getErrorMessage(e, "Could not assign this professional. Please try again."));
      setBusyId("");
    }
  };

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-semibold text-primary sm:text-[30px]">Users</h1>
        <p className="text-[13px] text-[#6B7C93]">Caregivers and healthcare professionals on the platform.</p>
      </div>
      {isAdmin && !!all?.length && (
        <Link to="/users/new" className={addBtn}>
          Add user
        </Link>
      )}
    </div>
  );

  if (!all) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {header}
        <LoadState loading={loading} error={error} />
      </div>
    );
  }

  if (all.length === 0) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {header}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#C6C6CD99] bg-white px-6 py-14 text-center">
          <img src={user} alt="No users" className="size-8 text-[#6B7C93]" />
          <p className="text-[15px] font-semibold text-primary">No users yet</p>
          <p className="text-[13px] text-[#6B7C93]">There are no users on the application yet.</p>
          {isAdmin && (
            <Link to="/users/new" className={addBtn}>
              Add user
            </Link>
          )}
        </div>
      </div>
    );
  }

  const onDuty = list.filter(canAssign).length;
  const available = list.filter((p) => key(p.availability) === "AVAILABLE").length;
  const cols = "grid grid-cols-[minmax(0,2.7fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-4";

  return (
    <div className="flex flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {taskId && (
        <Link
          to="/tasks"
          className="flex w-fit items-center gap-2 text-[12px] text-[#1D4ED8] hover:underline sm:text-[13px]"
        >
          <LucideArrowLeft aria-hidden="true" className="size-4" />
          Professionals
        </Link>
      )}

      {header}

      <section className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] py-4 px-5">
        <div className="flex items-start gap-4">
            <img src={user} alt="User" className="size-5 mt-4" />
          <div className="min-w-0 flex-1">
            <h2 className="text-[13px] font-semibold text-primary sm:text-[18px]">
              Browse healthcare and caregiver professionals
            </h2>
            <p className="text-[12px] text-primary sm:text-[13px]">
              Review availability, roles, and current status before assigning a professional to watch and care for a patient.
            </p>
          </div>
          <span className="hidden shrink-0 gap-2 text-[11px] sm:flex">
            <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-[#1D4ED8]">Care team</span>
            <span className="rounded-full bg-[#E8EDF5] px-3 py-1 text-[#6B7C93]">{list.length} professionals</span>
          </span>
        </div>

        <p className="mt-4 text-[13px] text-primary">
          Use the directory below to browse available professionals, compare roles and availability, and assign the best fit to a patient.
        </p>

        <div className="mt-1 flex flex-wrap justify-between gap-2 text-[12px] text-[#6B7C93]">
          <span className="flex items-center gap-1.5">
            <LucideClock aria-hidden="true" className="size-3.5" />
            {onDuty} on duty now
          </span>
          <span>{available} available for assignment</span>
        </div>
      </section>

      <section className="rounded-2xl border border-[#C6C6CD99] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[18px] font-semibold text-primary">All professionals</h2>
          <div className="flex gap-2">
            <Filter label="roles" value={role} onChange={setRole} options={uniq((p) => p.role)} />
            <Filter label="availability" value={availability} onChange={setAvailability} options={uniq((p) => p.availability)} />
          </div>
        </div>

        {assignError && (
          <p role="alert" className="mt-3 rounded-md bg-[#FEF2F2] px-3 py-2 text-[13px] text-[#B91C1C]">
            {assignError}
          </p>
        )}

        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[640px]">
            <div
              className={`${cols} rounded-xl border border-transparent bg-[#F8F9FF] px-4 py-3 text-[12px] text-[#6B7C93]`}
            >
              <span>Professional</span>
              <span>Role</span>
              <span>Availability</span>
              <span>Current patients</span>
              <span className="w-[72px]">Action</span>
            </div>

            {shown.length === 0 ? (
              <p className="py-10 text-center text-[13px] text-[#6B7C93]">No professionals match these filters.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {shown.map((p) => {
                  const ok = canAssign(p);
                  const n = p.currentPatientsCount ?? 0;
                  return (
                    <li
                      key={p.id}
                      className={`${cols} rounded-xl border border-[#C6C6CD99] bg-white px-4 py-4 text-[13px]`}
                    >
                      <span className="flex min-w-0 items-center gap-3 font-medium text-primary">
                        <Avatar p={p} />
                        {/* Opens the user's profile form, as the old Users table did */}
                        <Link to={`/users/${encodeURIComponent(p.id)}`} className="truncate hover:underline">
                          {p.name || "—"}
                        </Link>
                      </span>
                      <span className="truncate text-[#6B7C93]">{formatEnum(p.role)}</span>
                      <span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                            badgeTone[key(p.availability)] ?? "bg-[#F1F5F9] text-[#6B7C93]"
                          }`}
                        >
                          {formatEnum(p.availability)}
                        </span>
                      </span>
                      <span className="text-[#6B7C93]">
                        {n} patient{n === 1 ? "" : "s"}
                      </span>
                      <button
                        type="button"
                        disabled={!ok || busyId === p.id}
                        onClick={() => assign(p)}
                        className={`h-8 w-[72px] rounded-lg text-[12px] font-medium ${
                          ok
                            ? "cursor-pointer bg-[#2563EB] text-white hover:bg-[#1D4ED8] disabled:opacity-60"
                            : "cursor-not-allowed bg-[#F1F5F9] text-[#6B7C93]"
                        }`}
                      >
                        {ok ? (busyId === p.id ? "..." : "Assign") : "Unavailable"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-2 text-[11px] text-[#6B7C93]">
          <span>Showing {shown.length} professionals</span>
          <span>Select Assign to choose a patient and care responsibilities.</span>
        </div>
      </section>
    </div>
  );
};

export default Users;