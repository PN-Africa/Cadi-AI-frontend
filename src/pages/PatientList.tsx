import { Link } from "react-router-dom";
import { LucideSlidersHorizontal } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import { usePatients } from "../data/usePatients";

const columns =
  "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_2rem]";

const PatientList = () => {
  const { patients, isLoading, hasError, reload } = usePatients();

  return (
    <div className="px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
      <h1 className="font-bold text-[20px] sm:text-[22px] lg:text-[24px] text-primary">
        Patients
      </h1>

      <div role="table" aria-label="Patients" className="flex flex-col gap-3">
        <div
          role="row"
          className={`hidden sm:grid ${columns} items-center gap-x-3 border border-transparent px-6 text-[12px] sm:text-[13px] font-semibold text-primary`}
        >
          <span role="columnheader">Patients ID</span>
          <span role="columnheader" className="text-center">Status</span>
          <span role="columnheader" className="text-center">Last Activity</span>
          <span role="columnheader" aria-label="Actions" className="flex justify-end">
            <LucideSlidersHorizontal className="size-4 text-[#6B7C93]" aria-hidden="true" />
          </span>
        </div>

        <div
          role="rowgroup"
          className="rounded-xl border border-[#C6C6CD99] bg-white overflow-hidden divide-y divide-[#C6C6CD99]"
        >
          {isLoading ? (
            <Loading variant="table" rows={5} label="Loading patients" />
          ) : hasError ? (
            <div role="alert" className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <p className="font-semibold text-[15px] sm:text-[16px] text-primary">
                We couldn't load your patients
              </p>
              <p className="max-w-md text-[13px] sm:text-[14px] text-[#6B7C93]">
                Check your connection, then try again.
              </p>
              <button
                type="button"
                onClick={reload}
                className="cursor-pointer rounded-md border-[1.5px] border-[#1F3A5F] bg-[#1F3A5F] px-4 py-2 text-[13px] sm:text-[14px] text-white"
              >
                Try Again
              </button>
            </div>
          ) : patients.length === 0 ? (
            <p className="px-6 py-10 text-center text-[13px] sm:text-[14px] text-[#6B7C93]">
              No patients to show yet.
            </p>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                role="row"
                className={`relative grid ${columns} items-center gap-x-3 gap-y-2 px-4 sm:px-6 py-4 hover:bg-[#F8F9FF]`}
              >
                <div role="cell" className="min-w-0 sm:col-start-1">
                  <Link
                    to={`/patient/${patient.id}`}
                    className="text-[13px] sm:text-[14px] font-medium text-primary after:absolute after:inset-0 after:content-['']"
                  >
                    {patient.display}
                  </Link>
                </div>

                <div
                  role="cell"
                  aria-hidden="true"
                  className="col-start-2 row-start-1 flex items-center gap-[3px] justify-self-end sm:col-start-4"
                >
                  <span className="size-[5px] rounded-full bg-[#3B82F6]" />
                  <span className="size-[5px] rounded-full bg-[#3B82F6]" />
                  <span className="size-[5px] rounded-full bg-[#3B82F6]" />
                </div>

                <div
                  role="cell"
                  className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1 sm:justify-self-center"
                >
                  <StatusBadge status={patient.status} className="sm:min-w-[7.5rem]" />
                </div>

                <div
                  role="cell"
                  className="col-start-2 row-start-2 justify-self-end text-[12px] sm:text-[13px] text-primary sm:col-start-3 sm:row-start-1 sm:justify-self-center"
                >
                  <span className="sm:hidden text-[#6B7C93]">Last activity </span>
                  {patient.lastActivity}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;