import { useNavigate } from "react-router-dom";
import {
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { useState } from "react";
import { LucideEye, LucideEyeClosed, LucideInfo } from "lucide-react";
import toast from "react-hot-toast";
import { signUp, type SignUpPayload } from "../services/apiSignUp";

type FormData = {
  role: "caregiver" | "healthcare_professional";
  fullName: string;
  email: string;
  medicalLicenseId?: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const { register, formState, watch, handleSubmit } = useForm<FormData>({
    mode: "onBlur",
  });
  const { errors } = formState;

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const selectedRole = watch("role");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);

    try {
      const payload: SignUpPayload = {
        role: data.role.toUpperCase() as SignUpPayload["role"],
        email: data.email,
        medicalLicenseId: data.medicalLicenseId ?? "",
        password: data.password,
        confirmPassword: data.confirmPassword,
      };

      const res = await signUp(payload);

      toast.success(res.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      const backendMessage: string | undefined = error?.response?.data?.message;

      if (backendMessage?.includes("duplicate key value violates unique constraint")) {
        toast.error("An account with this email or phone number already exists.");
      } else {
        toast.error(backendMessage || "Unable to create account.");
      }

      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError: SubmitErrorHandler<FormData> = (errors) => {
    toast.error("Please check the highlighted fields.")
    console.log(errors);
  };

  return (
    <div className="bg-[#F8F9FF]">
      <div className="min-h-screen flex items-center justify-center px-4 py-6 lg:px-0 lg:py-10">
      <div className="border border-[#C6C6CD99] bg-white border-2 p-6 sm:p-8 lg:p-10">
        <div className="w-full md:w-[500px] flex flex-col items-start">
            <div className="w-full items-center justify-center flex">
                <p className="font-bold text-[20px] sm:text-[22px] lg:text-[24px] text-primary md:mt-5">CADI AI</p>
            </div>
            <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">Create your account</p>
            <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
            Register an authorized caregiver or clinical practitioner profile to access real-time patient telemetry and predictive vital alert streams.
            </p>
        </div>

        <form
            className="text-[14px] sm:text-[15px] lg:text-[16px] flex flex-col w-full md:w-[500px]"
            onSubmit={handleSubmit(onSubmit, onError)}
        >
            <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary">
            OPERATIONAL ROLE IDENTIFIER <span className="text-[#6B7C93] normal-case">[required]</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <label
                className={`flex-1 border-[1.5px] rounded-md border-[#6B7C93] p-3 sm:p-4 cursor-pointer flex items-start gap-2 ${
                selectedRole === "healthcare_professional" ? "border-[#76777D]" : "border-[#0D469C] bg-[#EEF3FC]"
                }`}
            >
                <input
                type="radio"
                value="caregiver"
                defaultChecked
                className="mt-1"
                {...register("role", {
                    required: "Please select a role",
                })}
                />
                <div>
                <p className="font-semibold text-primary">Caregiver</p>
                <p className="text-[11px] sm:text-[12px] lg:text-[13px] text-[#6B7C93]">
                    Family or professional direct care attendant
                </p>
                </div>
            </label>

            <label
                className={`flex-1 border-[1.5px] rounded-md border-[#6B7C93] p-3 sm:p-4 cursor-pointer flex items-start gap-2 ${
                selectedRole === "healthcare_professional" ? "border-[#0D469C] bg-[#EEF3FC]" : "border-[#76777D]"
                }`}
            >
                <input
                type="radio"
                value="healthcare_professional"
                className="mt-1"
                {...register("role", {
                    required: "Please select a role",
                })}
                />
                <div>
                <p className="font-semibold text-primary">Healthcare Professional</p>
                <p className="text-[11px] sm:text-[12px] lg:text-[13px] text-[#6B7C93]">
                    Physician, Registered Nurse, or Clinical Specialist
                </p>
                </div>
            </label>
            </div>
            {errors.role && (
            <p className="text-red-500 text-[11px] pt-1">{errors.role.message}</p>
            )}

            <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary">
            FULL NAME <span className="text-[#6B7C93] normal-case">[e.g. title + legal name]</span>
            </p>
            <div
            className={`border-[1.5px] rounded-md border-[#6B7C93] text-sm p-[10px] flex items-center ${
                errors?.fullName ? "border-red-500" : "border-[#76777D]"
            }`}
            >
            <input
                type="text"
                placeholder="e.g. Dr. Eleanor Vance, RN"
                className="w-full py-1 px-2 outline-none bg-transparent"
                {...register("fullName", {
                required: "This field is required",
                minLength: {
                    value: 2,
                    message: "Please enter your full name",
                },
                })}
            />
            </div>
            {errors.fullName && (
            <p className="text-red-500 text-[11px] pt-1">{errors.fullName.message}</p>
            )}

            <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary">WORK EMAIL OR DIRECT PHONE</p>
            <div
            className={`border-[1.5px] rounded-md border-[#6B7C93] text-sm p-[10px] flex items-center ${
                errors?.email ? "border-red-500" : "border-[#76777D]"
            }`}
            >
            <input
                type="text"
                placeholder="e.g. e.vance@stjudehealth.org"
                className="w-full py-1 px-2 outline-none bg-transparent"
                {...register("email", {
                required: "This field is required",
                pattern: {
                    value: /^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+?[0-9\s().-]{7,15})$/,
                    message: "Enter a valid email address or phone number",
                },
                })}
            />
            </div>
            {errors.email ? (
            <p className="text-red-500 text-[11px] pt-1">{errors.email.message}</p>
            ) : (
            <p className="text-[10px] sm:text-[11px] lg:text-[12px] text-[#6B7C93] pt-1">
                Enter your affiliated medical institution domain email for automated clinical verification.
            </p>
            )}

            <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary">MEDICAL LICENSE ID</p>
            <div
            className={`border-[1.5px] rounded-md border-[#6B7C93] text-sm p-[10px] flex items-center ${
                errors?.medicalLicenseId ? "border-red-500" : "border-[#76777D]"
            }`}
            >
            <input
                type="text"
                placeholder="e.g. MD-123456"
                className="w-full py-1 px-2 outline-none bg-transparent"
                {...register("medicalLicenseId", {
                required: "This field is required",
                })}
            />
            </div>
            {errors.medicalLicenseId ? (
            <p className="text-red-500 text-[11px] pt-1">{errors.medicalLicenseId.message}</p>
            ) : (
            <p className="text-[10px] sm:text-[11px] lg:text-[12px] text-[#6B7C93] pt-1">
                Enter your valid medical license ID. This would be verified with your institution on creation of your account. If you are a caregiver, please enter "N/A" in this field.
            </p>
            )}

            <div className="flex flex-row justify-between items-center pt-6 lg:pt-8">
            <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-primary">ACCESS SECURITY PASSWORD</p>
            </div>

            <div
            className={`border-[1.5px] rounded-md border-[#6B7C93] p-[10px] text-sm flex items-center gap-2 ${
                errors?.password ? "border-red-500" : "border-[#76777D]"
            }`}
            >
            <input
                type={showPassword ? "text" : "password"}
                className="w-full py-1 px-2 outline-none bg-transparent"
                {...register("password", {
                required: "This field is required",
                minLength: {
                    value: 12,
                    message: "Password must be at least 12 characters",
                },
                validate: {
                    hasUppercase: (value) =>
                    /[A-Z]/.test(value) || "Must contain at least one uppercase letter",
                    hasLowercase: (value) =>
                    /[a-z]/.test(value) || "Must contain at least one lowercase letter",
                    hasNumber: (value) =>
                    /\d/.test(value) || "Must contain at least one number",
                    hasSpecialChar: (value) =>
                    /[^A-Za-z0-9]/.test(value) || "Must contain at least one special character",
                },
                })}
            />

            <button
                type="button"
                onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
                }}
            >
                {!showPassword ? (
                <LucideEye color="#515F74" className="size-5 cursor-pointer" />
                ) : (
                <LucideEyeClosed color="#515F74" className="size-5 cursor-pointer" />
                )}
            </button>
            </div>
            {errors.password ? (
            <p className="text-red-500 text-[11px] pt-1">{errors.password.message}</p>
            ) : (
            <p className="text-[10px] sm:text-[11px] lg:text-[12px] text-[#6B7C93] pt-1 flex items-start gap-1">
                <LucideInfo className="size-4 shrink-0 mt-[1px]" />
                Must be at least 12 characters, and include uppercase, lowercase, a number, and a special character. Institutional multi-factor authentication (MFA) will be configured immediately upon preliminary verification.
            </p>
            )}

            <div className="flex flex-row justify-between items-center pt-6 lg:pt-8">
            <p className="text-[12px] sm:text-[13px] lg:text-[14px] text-primary">CONFIRM PASSWORD</p>
            </div>

            <div
            className={`border-[1.5px] rounded-md border-[#6B7C93] p-[10px] text-sm flex items-center gap-2 ${
                errors?.confirmPassword ? "border-red-500" : "border-[#76777D]"
            }`}
            >
            <input
                type={showPassword ? "text" : "password"}
                className="w-full py-1 px-2 outline-none bg-transparent"
                {...register("confirmPassword", {
                required: "This field is required",
                validate: (value) =>
                    value === watch("password") ||
                    "Passwords do not match",
                })}
            />

            <button
                type="button"
                onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
                }}
            >
                {!showPassword ? (
                <LucideEye color="#515F74" className="size-5 cursor-pointer" />
                ) : (
                <LucideEyeClosed color="#515F74" className="size-5 cursor-pointer" />
                )}
            </button>
            </div>
            {errors.confirmPassword && (
            <p className="text-red-500 text-[11px] pt-1">{errors.confirmPassword.message}</p>
            )}

            <button
            className="text-white bg-[#1F3A5F] cursor-pointer mt-6 lg:mt-[30px] border-[1.5px] rounded-md border-[#6B7C93] w-full py-4 disabled:bg-grey-400 disabled:border-grey-500 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            >
            {isSubmitting ? "Creating account..." : "Create Account ⟶"}
            </button>

            <p className="text-center text-sm text-[#6B7C93] mt-4 mb-10">
            Already have an authorized credential?{" "}
            <button
                type="button"
                onClick={() => navigate("/")}
                className="text-primary hover:underline cursor-pointer"
            >
                Sign in
            </button>
            </p>
        </form>
        </div>
    </div>
    </div>


  );
};

export default SignUp;