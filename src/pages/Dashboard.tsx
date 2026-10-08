import { useNavigate } from "react-router-dom";
import {
  LucideUsers,
  LucideAlertTriangle,
  LucideOctagonAlert,
  LucideCheckCircle2,
  LucideArrowRight,
} from "lucide-react";
import PatientAlert, { type PatientAlertData } from "../components/PatientAlert";

type PatientStatus = "Normal" | "Needs Attention" | "Alert";

interface PatientSummary {
  id: string;
  name: string;
  status: PatientStatus;
  lastUpdated: string;
}

// TODO: replace mock data below with real API wiring (Monitoring Data Service /
// Status Service / Alert Service), kept as simulated/structured data for the MVP
// per the implementation plan.
const mockPatients: PatientSummary[] = [
  { id: "p1", name: "Margaret Owusu", status: "Alert", lastUpdated: "2 min ago" },
  { id: "p2", name: "Tunde Bakare", status: "Needs Attention", lastUpdated: "14 min ago" },
  { id: "p3", name: "Grace Afolabi", status: "Normal", lastUpdated: "20 min ago" },
  { id: "p4", name: "Samuel Eze", status: "Normal", lastUpdated: "35 min ago" },
  { id: "p5", name: "Ruth Danjuma", status: "Needs Attention", lastUpdated: "41 min ago" },
];

const mockAlerts: PatientAlertData[] = [
  {
    id: "a1",
    patientId: "p1",
    patientName: "Margaret Owusu",
    type: "Possible Fall Detected",
    severity: "Alert",
    reason: "A sudden change in position and prolonged stillness was detected.",
    timestamp: "2 min ago",
  },
  {
    id: "a2",
    patientId: "p2",
    patientName: "Tunde Bakare",
    type: "Prolonged Inactivity",
    severity: "Needs Attention",
    reason: "No movement detected for over 45 minutes.",
    timestamp: "14 min ago",
  },
  {
    id: "a3",
    patientId: "p5",
    patientName: "Ruth Danjuma",
    type: "Abnormal Reading",
    severity: "Needs Attention",
    reason: "Heart rate reading is outside the patient's configured normal range.",
    timestamp: "41 min ago",
  },
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

const Dashboard = () => {
  const navigate = useNavigate();

  const patientsMonitored = mockPatients.length;
  const patientsNeedingAttention = mockPatients.filter(
    (p) => p.status === "Needs Attention" || p.status === "Alert"
  ).length;
  const activeAlerts = mockAlerts.length;

  const sortedPatients = [...mockPatients].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status]
  );

  return (
    <div className="min-h-screen bg-[#F8F9FF] p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">
            Dashboard
          </p>
          <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
            An overview of the patients you're monitoring and recent activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="text-white bg-[#1F3A5F] cursor-pointer border-[1.5px] rounded-md border-[#1F3A5F] px-4 py-2 text-[13px] sm:text-[14px] flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          View All Patients
          <LucideArrowRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-[#C6C6CD99] rounded-md p-4 sm:p-5 flex items-center gap-3">
          <div className="bg-[#EEF3FC] rounded-md p-2">
            <LucideUsers className="size-6 text-[#0D469C]" />
          </div>
          <div>
            <p className="text-[20px] sm:text-[22px] font-semibold text-primary">
              {patientsMonitored}
            </p>
            <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">Patients Monitored</p>
          </div>
        </div>

        <div className="bg-white border border-[#C6C6CD99] rounded-md p-4 sm:p-5 flex items-center gap-3">
          <div className="bg-[#FFF8E6] rounded-md p-2">
            <LucideAlertTriangle className="size-6 text-[#8A6116]" />
          </div>
          <div>
            <p className="text-[20px] sm:text-[22px] font-semibold text-primary">
              {patientsNeedingAttention}
            </p>
            <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">Needing Attention</p>
          </div>
        </div>

        <div className="bg-white border border-[#C6C6CD99] rounded-md p-4 sm:p-5 flex items-center gap-3">
          <div className="bg-[#FDECEC] rounded-md p-2">
            <LucideOctagonAlert className="size-6 text-[#8A1F1F]" />
          </div>
          <div>
            <p className="text-[20px] sm:text-[22px] font-semibold text-primary">
              {activeAlerts}
            </p>
            <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">Active Alerts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-[#C6C6CD99] rounded-md p-4 sm:p-6">
          <p className="font-semibold text-[15px] sm:text-[16px] text-primary mb-3">
            Patient Status
          </p>
          <div className="flex flex-col divide-y divide-[#C6C6CD99]">
            {sortedPatients.map((patient) => {
              const style = statusStyles[patient.status];
              const Icon = style.icon;

              return (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="py-3 flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div>
                    <p className="text-[13px] sm:text-[14px] text-primary font-medium">
                      {patient.name}
                    </p>
                    <p className="text-[11px] sm:text-[12px] text-[#6B7C93]">
                      Updated {patient.lastUpdated}
                    </p>
                  </div>
                  <p className={`text-[12px] sm:text-[13px] font-medium flex items-center gap-1.5 ${style.text}`}>
                    <Icon className="size-4 shrink-0" />
                    {style.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#C6C6CD99] rounded-md p-4 sm:p-6">
          <p className="font-semibold text-[15px] sm:text-[16px] text-primary mb-3">
            Recent Alerts
          </p>
          <div className="flex flex-col gap-3">
            {mockAlerts.length === 0 ? (
              <p className="text-[13px] text-[#6B7C93]">No recent alerts.</p>
            ) : (
              mockAlerts.map((alert) => <PatientAlert key={alert.id} alert={alert} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;