import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LucideSearch,
  LucideAlertTriangle,
  LucideOctagonAlert,
  LucideCheckCircle2,
  LucideChevronRight,
} from "lucide-react";

type PatientStatus = "Normal" | "Needs Attention" | "Alert";
type StatusFilter = "All" | PatientStatus;

interface Patient {
  id: string;
  name: string;
  age: number;
  room: string;
  status: PatientStatus;
  lastUpdated: string;
}

// TODO: replace with real API wiring — the backend should already scope this
// list to patients assigned to the logged-in caregiver.
const mockPatients: Patient[] = [
  { id: "p1", name: "Margaret Owusu", age: 78, room: "Room 4", status: "Alert", lastUpdated: "2 min ago" },
  { id: "p2", name: "Tunde Bakare", age: 82, room: "Room 7", status: "Needs Attention", lastUpdated: "14 min ago" },
  { id: "p3", name: "Grace Afolabi", age: 69, room: "Room 2", status: "Normal", lastUpdated: "20 min ago" },
  { id: "p4", name: "Samuel Eze", age: 74, room: "Room 9", status: "Normal", lastUpdated: "35 min ago" },
  { id: "p5", name: "Ruth Danjuma", age: 81, room: "Room 5", status: "Needs Attention", lastUpdated: "41 min ago" },
  { id: "p6", name: "Chinedu Okafor", age: 66, room: "Room 1", status: "Normal", lastUpdated: "1 hr ago" },
];

const statusOrder: Record<PatientStatus, number> = {
  Alert: 0,
  "Needs Attention": 1,
  Normal: 2,
};

const statusStyles: Record<
  PatientStatus,
  { icon: typeof LucideCheckCircle2; text: string; label: string }
> = {
  Normal: { icon: LucideCheckCircle2, text: "text-[#1E7D3B]", label: "Normal" },
  "Needs Attention": { icon: LucideAlertTriangle, text: "text-[#8A6116]", label: "Needs Attention" },
  Alert: { icon: LucideOctagonAlert, text: "text-[#8A1F1F]", label: "Alert" },
};

const statusFilters: StatusFilter[] = ["All", "Alert", "Needs Attention", "Normal"];

const PatientList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const filteredPatients = useMemo(() => {
    return mockPatients
      .filter((patient) =>
        patient.name.toLowerCase().includes(search.trim().toLowerCase())
      )
      .filter((patient) => statusFilter === "All" || patient.status === statusFilter)
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-[#F8F9FF] p-4 sm:p-6 lg:p-10">
      <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">
        Patients
      </p>
      <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
        Patients currently assigned to you, with their latest status.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <div className="border-[1.5px] rounded-md border-[#6B7C93] p-[10px] text-sm flex items-center gap-2 flex-1 bg-white">
          <LucideSearch className="size-4 text-[#6B7C93] shrink-0" />
          <input
            type="text"
            placeholder="Search patients by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none bg-transparent text-[14px]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`border-[1.5px] rounded-md px-3 py-2 text-[12px] sm:text-[13px] whitespace-nowrap cursor-pointer ${
                statusFilter === filter
                  ? "bg-[#1F3A5F] border-[#1F3A5F] text-white"
                  : "bg-white border-[#C6C6CD99] text-[#6B7C93]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#C6C6CD99] rounded-md mt-6 divide-y divide-[#C6C6CD99]">
        {filteredPatients.length === 0 ? (
          <p className="text-[13px] text-[#6B7C93] p-6 text-center">
            No patients match your search or filter.
          </p>
        ) : (
          filteredPatients.map((patient) => {
            const style = statusStyles[patient.status];
            const Icon = style.icon;

            return (
              <button
                key={patient.id}
                type="button"
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div>
                  <p className="text-[14px] sm:text-[15px] text-primary font-medium">
                    {patient.name}
                  </p>
                  <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
                    Age {patient.age} · {patient.room} · Updated {patient.lastUpdated}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p className={`text-[12px] sm:text-[13px] font-medium flex items-center gap-1.5 ${style.text}`}>
                    <Icon className="size-4 shrink-0" />
                    {style.label}
                  </p>
                  <LucideChevronRight className="size-4 text-[#6B7C93] shrink-0" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PatientList;