import { useNavigate } from "react-router-dom";
import { LucideAlertTriangle, LucideOctagonAlert } from "lucide-react";

export type AlertSeverity = "Needs Attention" | "Alert";

export interface PatientAlertData {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  severity: AlertSeverity;
  reason: string;
  timestamp: string;
}

const severityStyles: Record<
  AlertSeverity,
  { icon: typeof LucideAlertTriangle; bg: string; border: string; text: string; label: string }
> = {
  "Needs Attention": {
    icon: LucideAlertTriangle,
    bg: "bg-[#FFF8E6]",
    border: "border-[#E8B84B]",
    text: "text-[#8A6116]",
    label: "Needs Attention",
  },
  Alert: {
    icon: LucideOctagonAlert,
    bg: "bg-[#FDECEC]",
    border: "border-[#D64545]",
    text: "text-[#8A1F1F]",
    label: "Alert",
  },
};

interface PatientAlertProps {
  alert: PatientAlertData;
  linkToPatient?: boolean;
}

const PatientAlert = ({ alert, linkToPatient = true }: PatientAlertProps) => {
  const navigate = useNavigate();
  const styles = severityStyles[alert.severity];
  const Icon = styles.icon;

  return (
    <div
      className={`${styles.bg} border-[1.5px] ${styles.border} rounded-md p-4 flex flex-col gap-2 ${
        linkToPatient ? "cursor-pointer" : ""
      }`}
      onClick={linkToPatient ? () => navigate(`/patients/${alert.patientId}`) : undefined}
      role={linkToPatient ? "button" : undefined}
      tabIndex={linkToPatient ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`font-medium text-[14px] sm:text-[15px] flex items-center gap-2 ${styles.text}`}>
          <Icon className="size-5 shrink-0" />
          {styles.label}
        </p>
        <span className="text-[11px] sm:text-[12px] text-[#6B7C93] whitespace-nowrap">
          {alert.timestamp}
        </span>
      </div>

      <p className="text-[13px] sm:text-[14px] text-primary font-medium">
        {alert.patientName} — {alert.type}
      </p>

      <p className="text-[12px] sm:text-[13px] text-[#6B7C93]">{alert.reason}</p>
    </div>
  );
};

export default PatientAlert;