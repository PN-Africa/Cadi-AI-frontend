import { useParams, useNavigate } from "react-router-dom";
import {
  LucideArrowLeft,
  LucideHeartPulse,
  LucideDroplet,
  LucideThermometer,
  LucideActivity,
  LucideMapPin,
  LucideUserCircle2,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideOctagonAlert,
} from "lucide-react";
import PatientAlert, { type PatientAlertData } from "../components/PatientAlert";

type PatientStatus = "Normal" | "Needs Attention" | "Alert";

interface VitalReading {
  label: string;
  value: string | null;
  unit?: string;
  icon: typeof LucideHeartPulse;
  updatedAt: string | null;
}

interface PatientDetail {
  id: string;
  name: string;
  age: number;
  room: string;
  status: PatientStatus;
  caregiverName: string;
  caregiverRole: string;
  vitals: VitalReading[];
  activeAlert?: PatientAlertData;
}

// TODO: replace with real API wiring (Monitoring Data Service) — current
// readings only, no history, per MVP scope for this view.
const mockPatientDetail: Record<string, PatientDetail> = {
  p1: {
    id: "p1",
    name: "Margaret Owusu",
    age: 78,
    room: "Room 4",
    status: "Alert",
    caregiverName: "Nurse Adaeze Nwosu",
    caregiverRole: "Caregiver",
    vitals: [
      { label: "Heart Rate", value: "112", unit: "bpm", icon: LucideHeartPulse, updatedAt: "2 min ago" },
      { label: "Blood Oxygen", value: "94", unit: "%", icon: LucideDroplet, updatedAt: "2 min ago" },
      { label: "Temperature", value: "37.8", unit: "°C", icon: LucideThermometer, updatedAt: "5 min ago" },
      { label: "Movement", value: null, unit: undefined, icon: LucideActivity, updatedAt: null },
      { label: "Position", value: "Lying down", unit: undefined, icon: LucideMapPin, updatedAt: "2 min ago" },
    ],
    activeAlert: {
      id: "a1",
      patientId: "p1",
      patientName: "Margaret Owusu",
      type: "Possible Fall Detected",
      severity: "Alert",
      reason: "A sudden change in position and prolonged stillness was detected.",
      timestamp: "2 min ago",
    },
  },
  p2: {
    id: "p2",
    name: "Tunde Bakare",
    age: 82,
    room: "Room 7",
    status: "Needs Attention",
    caregiverName: "Nurse Adaeze Nwosu",
    caregiverRole: "Caregiver",
    vitals: [
      { label: "Heart Rate", value: "76", unit: "bpm", icon: LucideHeartPulse, updatedAt: "14 min ago" },
      { label: "Blood Oxygen", value: "97", unit: "%", icon: LucideDroplet, updatedAt: "14 min ago" },
      { label: "Temperature", value: "36.9", unit: "°C", icon: LucideThermometer, updatedAt: "14 min ago" },
      { label: "Movement", value: "No movement detected", unit: undefined, icon: LucideActivity, updatedAt: "45 min ago" },
      { label: "Position", value: "Seated", unit: undefined, icon: LucideMapPin, updatedAt: "14 min ago" },
    ],
    activeAlert: {
      id: "a2",
      patientId: "p2",
      patientName: "Tunde Bakare",
      type: "Prolonged Inactivity",
      severity: "Needs Attention",
      reason: "No movement detected for over 45 minutes.",
      timestamp: "14 min ago",
    },
  },
  p3: {
    id: "p3",
    name: "Grace Afolabi",
    age: 69,
    room: "Room 2",
    status: "Normal",
    caregiverName: "Nurse Bola Martins",
    caregiverRole: "Caregiver",
    vitals: [
      { label: "Heart Rate", value: "72", unit: "bpm", icon: LucideHeartPulse, updatedAt: "20 min ago" },
      { label: "Blood Oxygen", value: "98", unit: "%", icon: LucideDroplet, updatedAt: "20 min ago" },
      { label: "Temperature", value: "36.7", unit: "°C", icon: LucideThermometer, updatedAt: "20 min ago" },
      { label: "Movement", value: "Normal activity", unit: undefined, icon: LucideActivity, updatedAt: "20 min ago" },
      { label: "Position", value: "Walking", unit: undefined, icon: LucideMapPin, updatedAt: "20 min ago" },
    ],
  },
};

const statusStyles: Record<
  PatientStatus,
  { icon: typeof LucideCheckCircle2; text: string; label: string }
> = {
  Normal: { icon: LucideCheckCircle2, text: "text-[#1E7D3B]", label: "Normal" },
  "Needs Attention": { icon: LucideAlertTriangle, text: "text-[#8A6116]", label: "Needs Attention" },
  Alert: { icon: LucideOctagonAlert, text: "text-[#8A1F1F]", label: "Alert" },
};

const Patient = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const patient = id ? mockPatientDetail[id] : undefined;

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] p-4 sm:p-6 lg:p-10">
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="text-primary text-[13px] sm:text-[14px] flex items-center gap-1.5 hover:underline cursor-pointer"
        >
          <LucideArrowLeft className="size-4" />
          Back to Patients
        </button>
        <p className="text-[14px] text-[#6B7C93] mt-6">Patient not found.</p>
      </div>
    );
  }

  const style = statusStyles[patient.status];
  const StatusIcon = style.icon;

  return (
    <div className="min-h-screen bg-[#F8F9FF] p-4 sm:p-6 lg:p-10">
      <button
        type="button"
        onClick={() => navigate("/patients")}
        className="text-primary text-[13px] sm:text-[14px] flex items-center gap-1.5 hover:underline cursor-pointer"
      >
        <LucideArrowLeft className="size-4" />
        Back to Patients
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <div>
          <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">
            {patient.name}
          </p>
          <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
            Age {patient.age} · {patient.room}
          </p>
        </div>

        <p className={`text-[13px] sm:text-[14px] font-medium flex items-center gap-1.5 ${style.text}`}>
          <StatusIcon className="size-5 shrink-0" />
          {style.label}
        </p>
      </div>

      {patient.activeAlert && (
        <div className="mt-4">
          <PatientAlert alert={patient.activeAlert} linkToPatient={false} />
        </div>
      )}

      <div className="bg-white border border-[#C6C6CD99] rounded-md p-4 sm:p-6 mt-6">
        <p className="font-semibold text-[15px] sm:text-[16px] text-primary mb-3">
          Assigned Caregiver
        </p>
        <div className="flex items-center gap-3">
          <div className="bg-[#EEF3FC] rounded-md p-2">
            <LucideUserCircle2 className="size-6 text-[#0D469C]" />
          </div>
          <div>
            <p className="text-[14px] text-primary font-medium">{patient.caregiverName}</p>
            <p className="text-[12px] text-[#6B7C93]">{patient.caregiverRole}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#C6C6CD99] rounded-md p-4 sm:p-6 mt-6">
        <p className="font-semibold text-[15px] sm:text-[16px] text-primary mb-3">
          Current Vitals
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patient.vitals.map((vital) => {
            const Icon = vital.icon;
            const hasReading = vital.value !== null;

            return (
              <div
                key={vital.label}
                className="border border-[#C6C6CD99] rounded-md p-3 flex items-start gap-3"
              >
                <Icon className="size-5 text-[#0D469C] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] text-[#6B7C93]">{vital.label}</p>
                  {hasReading ? (
                    <>
                      <p className="text-[15px] text-primary font-semibold">
                        {vital.value}
                        {vital.unit ? ` ${vital.unit}` : ""}
                      </p>
                      <p className="text-[11px] text-[#6B7C93]">Updated {vital.updatedAt}</p>
                    </>
                  ) : (
                    <p className="text-[13px] text-[#6B7C93] italic">No recent data</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Patient;