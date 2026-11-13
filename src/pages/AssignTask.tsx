import { Link } from "react-router-dom";
import { LucideArrowRight, LucideRefreshCw } from "lucide-react";
import Loading from "../components/Loading";
import { useRequest } from "../data/useRequest";
import { getErrorMessage } from "../services/apiPatients";
import { formatEnum, getTasks } from "../services/apiTasks";

const cardClass = "rounded-xl border border-[#C6C6CD99] bg-white p-5";

const AssignTask = () => {
  const { data, isLoading, error, reload } = useRequest("admin-tasks", getTasks);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Loading variant="cards" label="Loading tasks" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <section role="alert" className={`${cardClass} text-center`}>
          <h1 className="text-[26px] font-semibold text-primary sm:text-[30px]">Tasks</h1>
          <p className="mt-2 text-[13px] text-[#6B7C93]">
            {getErrorMessage(error, "We couldn't load tasks. Please try again.")}
          </p>
          <button
            type="button"
            onClick={reload}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1D4ED8]"
          >
            <LucideRefreshCw aria-hidden="true" className="size-4" />
            Try again
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-[24px] font-semibold text-primary sm:text-[28px]">Tasks</h1>
        <p className="mt-1 text-[13px] text-[#6B7C93]">
          Review recent alerts and assign follow-up to a healthcare professional.
        </p>
      </header>

      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-semibold text-primary">Recent alerts</h2>
            <p className="mt-1 text-[12px] text-[#6B7C93]">
              {data.alerts.length} alert{data.alerts.length === 1 ? "" : "s"}
              {data.responders.length > 0
                ? ` · ${data.responders.length} professional${data.responders.length === 1 ? "" : "s"} available`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={reload}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#C6C6CD99] px-3 py-2 text-[12px] font-medium text-[#1D4ED8] hover:bg-[#F8F9FF]"
          >
            <LucideRefreshCw aria-hidden="true" className="size-4" />
            Refresh
          </button>
        </div>

        {data.alerts.length === 0 ? (
          <p className="mt-5 rounded-lg bg-[#F8F9FF] px-4 py-8 text-center text-[13px] text-[#6B7C93]">
            No recent alerts need task assignment.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {data.alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#C6C6CD99] px-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-primary">{alert.detection}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#6B7C93]">
                    {alert.status && <span>{formatEnum(alert.status)}</span>}
                    {alert.howLong && <span>{alert.howLong}</span>}
                    {alert.isAssigned && (
                      <span>Assigned to {alert.assignedToName || "a professional"}</span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/users?taskId=${encodeURIComponent(alert.id)}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[#2563EB] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#1D4ED8]"
                >
                  {alert.isAssigned ? "Reassign" : "Assign"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AssignTask;
