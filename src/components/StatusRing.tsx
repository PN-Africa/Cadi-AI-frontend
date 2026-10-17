import { statusLabels, type PatientStatus } from "../services/patientTypes";

const ringColors: Record<PatientStatus, string> = {
  normal: "border-[#22C55E]",
  "needs attention": "border-[#CA8A04]",
  emergency: "border-[#EF4444]",
};

interface StatusRingProps {
  level: PatientStatus;
  thick?: boolean;
  className?: string;
}

const StatusRing = ({ level, thick = false, className = "" }: StatusRingProps) => (
  <span
    role="img"
    aria-label={statusLabels[level]}
    className={`inline-block size-4 shrink-0 rounded-full bg-white ${
      thick ? "border-[3px]" : "border-2"
    } ${ringColors[level]} ${className}`}
  />
);

export default StatusRing;