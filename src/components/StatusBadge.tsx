import { statusLabels, type PatientStatus } from "../data/patientTypes";

const badgeStyles: Record<PatientStatus, string> = {
  normal: "bg-[#BBF7D0] text-[#15803D]",
  "needs attention": "bg-[#FEF08A] text-[#B45309]",
  emergency: "bg-[#FECACA] text-[#B91C1C]",
};

interface StatusBadgeProps {
  status: PatientStatus;
  withRing?: boolean;
  className?: string;
}

const StatusBadge = ({ status, withRing = false, className = "" }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1 text-[12px] sm:text-[13px] whitespace-nowrap ${badgeStyles[status]} ${className}`}
  >
    {withRing && (
      <span aria-hidden="true" className="size-3 rounded-full border-2 border-current" />
    )}
    {statusLabels[status]}
  </span>
);

export default StatusBadge;