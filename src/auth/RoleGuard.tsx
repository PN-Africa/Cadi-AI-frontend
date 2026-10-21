import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LucideLock } from "lucide-react";
import { useAuthStore } from "./auth";

export type AppRole = "HEALTHCARE_PROFESSIONAL" | "CAREGIVER";

export const useRole = () => {
  const rawRole = useAuthStore((state) => state.user?.role);
  const normalized = rawRole?.trim().toUpperCase().replace(/[\s-]+/g, "_");

  const role: AppRole | null =
    normalized === "HEALTHCARE_PROFESSIONAL"
      ? "HEALTHCARE_PROFESSIONAL"
      : normalized === "CAREGIVER"
        ? "CAREGIVER"
        : null;

  return {
    role,
    isHealthcareProfessional: role === "HEALTHCARE_PROFESSIONAL",
    isCaregiver: role === "CAREGIVER",
  };
};

interface RoleGuardProps {
  allow: AppRole[];
  children: ReactNode;
}

const RoleGuard = ({ allow, children }: RoleGuardProps) => {
  const { role } = useRole();

  if (!role || !allow.includes(role)) {
    return (
      <div className="flex items-center justify-center px-4 py-16">
        <div
          role="alert"
          className="w-full max-w-[460px] bg-white border border-[#C6C6CD99] rounded-md p-6 sm:p-8 flex flex-col items-center text-center gap-3"
        >
          <LucideLock className="size-8 text-[#6B7C93]" aria-hidden="true" />
          <p className="font-semibold text-primary text-[16px] sm:text-[18px]">
            You don't have access to this page
          </p>
          <p className="text-[13px] sm:text-[14px] text-[#6B7C93]">
            This page is only available to healthcare professionals. Your account
            has read-only access.
          </p>
          <Link
            to="/patients"
            className="mt-2 text-[14px] text-[#0D469C] font-medium hover:underline"
          >
            Back to patients
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;