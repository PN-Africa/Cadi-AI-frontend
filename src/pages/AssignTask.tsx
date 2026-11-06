import { useState } from "react";
import type { ReactNode } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LucideAlertTriangle,
  LucideArrowLeft,
  LucideBell,
  LucideCheck,
  LucideChevronDown,
  LucideChevronRight,
  LucideClock,
  LucideFileText,
  LucideInfo,
  LucideRefreshCw,
  LucideUser,
} from "lucide-react";
import Loading from "../components/Loading";
import { useAuthStore } from "../auth/auth";
import { isAdminRole } from "../auth/roles";
import { useRequest } from "../data/useRequest";
import { usePatients } from "../data/usePatients";
import { getErrorMessage } from "../services/apiPatients";
import {
  assignTask,
  formatEnum,
  getTasks,
  type AlertDetection,
  type Responder,
  type TasksData,
} from "../services/apiTasks";

const cardClass = "rounded-xl border border-[#C6C6CD99] bg-white p-5";
const headingClass = "text-[16px] sm:text-[18px] font-semibold text-primary";
const fieldClass =
  "w-full rounded-lg border border-[#C6C6CD99] bg-[#F8F9FF] px-3 py-2.5 text-[12px] sm:text-[13px] text-primary outline-none placeholder:text-[#9CA3AF] focus:border-[#2563EB]";

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const dueOptions = [
  { value: "5", label: "Within 5 minutes" },
  { value: "15", label: "Within 15 minutes" },
  { value: "30", label: "Within 30 minutes" },
  { value: "45", label: "Within 45 minutes" },
  { value: "60", label: "Within 1 hour" },
];

const requirements = [
  {
    title: "Assign a caregiver or health professional",
    body: "Choose the best responder for this case and prepare the task details before sending the assignment.",
    Icon: LucideUser,
  },
  {
    title: "Review case context",
    body: "Keep the patient, alert type, and response window visible while preparing the assignment.",
    Icon: LucideFileText,
  },
  {
    title: "Prepare the assignment message",
    body: "Add any relevant context, next steps, or follow-up expectations for the assigned responder.",
    Icon: LucideBell,
  },
];

const splitPatient = (value: string) => {
  const match = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(value.trim());
  return match ? { name: match[1].trim(), code: match[2].trim() } : { name: value.trim(), code: "" };
};

const codeFromDisplay = (display: string) => /\(([^)]+)\)\s*$/.exec(display)?.[1]?.trim() ?? "";

const Select = ({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) => (
  <div className="relative">
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${fieldClass} cursor-pointer appearance-none pr-9 ${value ? "" : "text-[#9CA3AF]"}`}
    >
      {children}
    </select>
    <LucideChevronDown
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#6B7C93]"
      aria-hidden="true"
    />
  </div>
);

const Label = ({ htmlFor, children }: { htmlFor: string; children: ReactNode }) => (
  <label htmlFor={htmlFor} className="text-[11px] sm:text-[12px] text-primary">
    {children}
  </label>
);

const ResponderAvatar = ({ responder }: { responder: Responder }) => {
  const [failed, setFailed] = useState(false);

  if (!responder.pic || failed) {
    return (
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EEF3FC] text-[12px] font-medium text-[#2563EB]"
      >
        {responder.name
          .split(" ")
          .slice(0, 2)
          .map((word) => word[0])
          .join("")}
      </span>
    );
  }

  return (
    <img
      src={responder.pic}
      alt=""
      onError={() => setFailed(true)}
      className="size-9 shrink-0 rounded-full object-cover"
    />
  );
};

interface AssignFormProps {
  taskDetails: ReactNode;
  alert: AlertDetection;
  data: TasksData;
  patientName: string;
  onAssigned: () => void;
}

const AssignForm = ({ taskDetails, alert, data, patientName, onAssigned }: AssignFormProps) => {
  const firstName = patientName.split(/\s+/)[0] || "the patient";

  const [taskType, setTaskType] = useState(
    `${alert.detection.replace(/\s+(detected|detection)$/i, "")} follow-up`
  );
  const [assignTo, setAssignTo] = useState("");
  const [priority, setPriority] = useState("HIGH");
  const [dueBy, setDueBy] = useState("5");
  const [message, setMessage] = useState(
    `Check on ${firstName}, confirm safety, and document the outcome.`
  );
  const [isSending, setIsSending] = useState(false);

  const selected = data.responders.find((responder) => responder.id === assignTo);

  const checklist = [
    { label: "Confirm the task details", done: taskType.trim() !== "" },
    { label: "Select a caregiver or health professional", done: assignTo !== "" },
    { label: "Review the assignment message", done: message.trim() !== "" },
  ];

  const handleAssign = async () => {
    if (isSending || alert.isAssigned) return;

    if (!taskType.trim()) return void toast.error("Add a task type.");
    if (!assignTo) return void toast.error("Select a caregiver or health professional.");
    if (!message.trim()) return void toast.error("Add an assignment message.");

    setIsSending(true);
    try {
      await assignTask({
        eventId: alert.id,
        taskType: taskType.trim(),
        assignToUserId: assignTo,
        priority,
        dueBy: `${dueBy} mins`,
        assignmentMessage: message.trim(),
      });
      toast.success(`Task assigned to ${selected?.name ?? "the selected responder"}`);
      onAssigned();
    } catch (error) {
      toast.error(getErrorMessage(error, "We couldn't assign this task. Please try again."));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.9fr_1fr]">
      <div className="flex flex-col gap-5">
        {taskDetails}
        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <h2 className={headingClass}>Assignment details</h2>
            <span className="text-[11px] sm:text-[12px] text-[#6B7C93]">Assignment preparation</span>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="taskType">Task type</Label>
              <input
                id="taskType"
                type="text"
                value={taskType}
                onChange={(event) => setTaskType(event.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignTo">Assign to</Label>
              <Select id="assignTo" value={assignTo} onChange={setAssignTo}>
                <option value="">Select caregiver or health professional</option>
                {data.responders.map((responder) => (
                  <option key={responder.id} value={responder.id}>
                    {responder.name}
                    {responder.professionalTitle ? ` (${formatEnum(responder.professionalTitle)})` : ""}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" value={priority} onChange={setPriority}>
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueBy">Due by</Label>
              <Select id="dueBy" value={dueBy} onChange={setDueBy}>
                {dueOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignmentMessage">Assignment message</Label>
              <textarea
                id="assignmentMessage"
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className={`${fieldClass} resize-none bg-white`}
              />
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
            <LucideInfo className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            The task will be sent to the selected caregiver or health professional once the assignment is
            confirmed.
          </p>
        </section>
      </div>

      <div className="flex flex-col gap-5">
        <section className={cardClass}>
          <h2 className={headingClass}>Assign response</h2>
          <p className="mt-2 text-[12px] sm:text-[13px] text-[#6B7C93]">
            Choose the best responder for this case and confirm the assignment.
          </p>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#C6C6CD99] bg-[#F8F9FF] p-3">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#C6C6CD99] bg-white text-[#6B7C93]"
            >
              <LucideUser className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">Assigned responder</p>
              <p className="truncate text-[12px] sm:text-[13px] font-semibold text-primary">
                {alert.isAssigned ? alert.assignedToName || "Assigned" : "Not assigned"}
              </p>
              <p className="text-[10px] sm:text-[11px] text-[#6B7C93]">
                {alert.isAssigned ? "An assignment has been sent." : "No assignment has been sent yet."}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] sm:text-[12px] text-[#6B7C93]">Available responders</p>
          {data.responders.length === 0 ? (
            <p className="mt-2 text-[12px] sm:text-[13px] text-[#6B7C93]">
              No responders are available right now.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {data.responders.map((responder) => {
                const isSelected = responder.id === assignTo;

                return (
                  <li key={responder.id}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setAssignTo(isSelected ? "" : responder.id)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 text-left ${
                        isSelected ? "border-[#2563EB] bg-[#F5F9FF]" : "border-[#C6C6CD99]"
                      }`}
                    >
                      <ResponderAvatar responder={responder} />
                      <span className="min-w-0">
                        <span className="block truncate text-[12px] sm:text-[13px] font-semibold text-primary">
                          {responder.name}
                        </span>
                        <span className="block truncate text-[10px] sm:text-[11px] text-[#6B7C93]">
                          {[formatEnum(responder.professionalTitle), formatEnum(responder.dutyStatus)]
                            .filter(Boolean)
                            .join(" \u2022 ")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            onClick={handleAssign}
            disabled={isSending || alert.isAssigned}
            className="mt-4 w-full cursor-pointer rounded-lg bg-[#2563EB] py-2.5 text-[13px] sm:text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? "Assigning..." : "Assign task"}
          </button>

          <p className="mt-3 flex items-start gap-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
            <LucideInfo className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Choose a caregiver or health professional, then confirm the assignment.
          </p>
        </section>

        <section className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-5">
          <h2 className="text-[14px] sm:text-[16px] font-semibold text-primary">Before sending the assignment</h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-[12px] sm:text-[13px] text-primary">
                <span
                  aria-hidden="true"
                  className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border ${
                    item.done ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#93A3B8] bg-white"
                  }`}
                >
                  {item.done && <LucideCheck className="size-2.5" strokeWidth={3} />}
                </span>
                {item.label}
                <span className="sr-only">{item.done ? " (done)" : " (not done)"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] sm:text-[12px] text-[#6B7C93]">
            The alert remains open until the assigned responder confirms the outcome.
          </p>
        </section>
      </div>
    </div>
  );
};

const AssignTaskContent = () => {
  const [params] = useSearchParams();
  const { data, isLoading, error, reload, refresh } = useRequest("admin-tasks", getTasks);
  const { patients } = usePatients();

  if (isLoading) {
    return <Loading variant="spinner" label="Loading tasks" />;
  }

  if (error != null || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl border border-[#C6C6CD99] bg-white p-8 text-center sm:p-10"
        >
          <p className="font-semibold text-[16px] sm:text-[18px] text-primary">We couldn't load tasks</p>
          <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">
            Check your connection, then try again.
          </p>
          <button
            type="button"
            onClick={reload}
            className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border-[1.5px] border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-[13px] sm:text-[14px] text-white"
          >
            <LucideRefreshCw className="size-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const requestedId = params.get("event");
  const alert =
    data.alerts.find((item) => item.id === requestedId) ??
    data.alerts.find((item) => !item.isAssigned) ??
    data.alerts[0];
  const unassignedCount = data.alerts.filter((item) => !item.isAssigned).length;

  const back = (
    <Link to="/dashboard" className="flex w-fit items-center gap-1.5 text-[12px] sm:text-[13px] text-[#2563EB]">
      <LucideArrowLeft className="size-4" aria-hidden="true" />
      Tasks
    </Link>
  );

  if (!alert) {
    return (
      <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">
        {back}
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[#C6C6CD99] bg-white p-8 text-center sm:p-10">
          <p className="font-semibold text-[16px] sm:text-[18px] text-primary">No alerts need assignment</p>
          <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">
            New alert detections will appear here when a caregiver or health professional needs to be assigned.
          </p>
        </div>
      </div>
    );
  }

  const { name: patientName, code: patientCode } = splitPatient(data.taskDetails.unassignedPatient);
  const patientId = patientCode
    ? patients.find((patient) => codeFromDisplay(patient.display) === patientCode)?.id
    : undefined;

  const elapsedMinutes = /(\d+)/.exec(alert.howLong)?.[1];
  const elapsed = elapsedMinutes ? `${elapsedMinutes} min elapsed` : alert.howLong;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">
      <h1 className="sr-only">Assign task</h1>
      {back}

      <section className="rounded-xl border border-[#FCA5A5] bg-[#FEE2E2]/70 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626]"
            >
              <LucideAlertTriangle className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[15px] sm:text-[18px] font-semibold text-primary">{alert.detection}</h2>
              <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">
                {[patientName, alert.howLong].filter(Boolean).join(" \u2022 ")}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {!alert.isAssigned && (
              <span className="rounded-md border border-[#FCA5A5] bg-[#FEE2E2] px-2 py-0.5 text-[11px] sm:text-[12px] font-medium text-[#DC2626]">
                Critical
              </span>
            )}
            <span className="rounded-md border border-[#C6C6CD] bg-white/70 px-2 py-0.5 text-[11px] sm:text-[12px] text-[#475569]">
              {alert.isAssigned ? `Assigned${alert.assignedToName ? ` to ${alert.assignedToName}` : ""}` : "Awaiting assignment"}
            </span>
          </div>
        </div>

        <p className="mt-3 text-[12px] sm:text-[13px] text-primary">
          A possible fall has been flagged. Patient safety and any injury are not yet confirmed. Assign a
          caregiver or health professional to investigate.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-[12px] text-[#6B7C93]">
          <p className="flex items-center gap-1.5">
            <LucideClock className="size-3.5" aria-hidden="true" />
            5 min response target {elapsed ? `\u2022 ${elapsed}` : ""}
          </p>
          <p>
            {unassignedCount} critical alert{unassignedCount === 1 ? "" : "s"} need{unassignedCount === 1 ? "s" : ""}{" "}
            assignment
          </p>
        </div>
      </section>

      <AssignForm
        key={alert.id}
        alert={alert}
        data={data}
        patientName={patientName}
        onAssigned={refresh}
        taskDetails={
          <section className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={headingClass}>Task details</h2>
              {patientId && (
                <Link
                  to={`/patient/${patientId}`}
                  className="flex items-center gap-0.5 text-[11px] sm:text-[12px] text-[#2563EB]"
                >
                  View patient profile
                  <LucideChevronRight className="size-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-[#C6C6CD99] bg-[#F8F9FF] p-3 sm:grid-cols-3">
              <div>
                <dt className="text-[10px] sm:text-[11px] text-[#6B7C93]">Patient</dt>
                <dd className="mt-1 text-[12px] sm:text-[13px] font-semibold text-primary">
                  {patientName || "Not available"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] sm:text-[11px] text-[#6B7C93]">Event location</dt>
                <dd className="mt-1 text-[12px] sm:text-[13px] font-semibold text-primary">
                  {data.taskDetails.eventLocation || "Not available"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] sm:text-[11px] text-[#6B7C93]">Patient safety</dt>
                <dd className="mt-1 text-[12px] sm:text-[13px] font-semibold text-primary">
                  {data.taskDetails.patientSafety || "Unconfirmed"}
                </dd>
              </div>
            </dl>

            <h3 className="mt-5 text-[12px] sm:text-[13px] font-semibold text-primary">Task requirements</h3>
            <ul className="mt-3 flex flex-col gap-3">
              {requirements.map(({ title, body, Icon }) => (
                <li key={title} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]"
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-[12px] sm:text-[13px] font-medium text-primary">{title}</p>
                    <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        }
      />
    </div>
  );
};

const AssignTask = () => {
  const role = useAuthStore((state) => state.user?.role);

  if (!isAdminRole(role)) return <Navigate to="/dashboard" replace />;

  return <AssignTaskContent />;
};

export default AssignTask;