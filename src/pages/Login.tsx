import { useNavigate, useSearchParams } from "react-router-dom";
import {
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { useState } from "react";
import { LucideAlertTriangle, LucideEye, LucideEyeClosed } from "lucide-react";
import toast from "react-hot-toast";
import { login, type LoginPayload } from "../services/apiLogin";
import { forgotPassword, type ForgotPasswordPayload } from "../services/apiResetPassword";

type FormData = {
  email?: string;
  password: string;
  confirmPassword?: string;
};

const Login = () => {
  const { register, formState, watch, handleSubmit } = useForm<FormData>();
  const { errors } = formState;

  const navigate = useNavigate();
//   const location = useLocation();
//   const from = location.state?.from?.pathname || "/dashboard";
//   const { setAuth } = useAuthStore();

  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
//   const [resetPassword, setResetPassword] = useState("");

  const isResetEmailStage = isResetMode && !resetToken;
  const isNewPasswordStage = isResetMode && !!resetToken;

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // New-password submission (isNewPasswordStage) isn't wired up yet.
    if (isNewPasswordStage) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isResetEmailStage) {
        const payload: ForgotPasswordPayload = {
          email: data.email ?? "",
        };

        const res = await forgotPassword(payload);
        toast.success(res.message);
        return;
      }

      const payload: LoginPayload = {
        identifier: data.email ?? "",
        password: data.password,
      };

      await login(payload);

      navigate("/dashboard");
    } catch (error: any) {
      const backendMessage: string | undefined = error?.response?.data?.message;

      if (isResetEmailStage) {
        toast.error(backendMessage || "Unable to send reset link.");
      } else {
        toast.error("Invalid Credentials.");
      }

      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError: SubmitErrorHandler<FormData> = (errors) => {
    toast.error("Invalid Credentials.")
    console.log(errors);
  };

  return (
    <div className="bg-[#F8F9FF]">
      <div className="min-h-screen flex items-center justify-center px-4 py-6 lg:px-0 lg:py-10">
      <div className="border border-[#C6C6CD99] bg-white border-2 p-6 sm:p-8 lg:p-10">
        <div className="w-full items-center justify-center flex">
            <p className="font-bold text-[20px] sm:text-[22px] lg:text-[24px] text-primary md:mt-5">CADI AI</p>
        </div>

        <div className="w-full md:w-[500px] flex flex-col items-start pt-6 lg:pt-8">
            <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">
            {isResetMode ? "Reset Password" : "Sign In"}
            </p>
            {!isResetMode && (
            <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
                Sign in to access patient telemetry and care alerts
            </p>
            )}
        </div>

        <form
            className="text-[14px] sm:text-[15px] lg:text-[16px] flex flex-col w-full md:w-[500px]"
            onSubmit={handleSubmit(onSubmit, onError)}
        >
            {!isResetMode && (
            <>
                <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary uppercase">Email or Phone Number</p>
                <div
                className={`border-[1.5px] rounded-md border-[#6B7C93] p-[10px] text-sm flex items-center ${
                    errors?.email ? "border-red-500" : "border-[#76777D]"
                }`}
                >
                <input
                    type="text"
                    placeholder="e.g. dr.patel@hospital.org or +1 (555) 000-0000"
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
            </>
            )}

            {isResetEmailStage && (
            <>
                <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary">WORK EMAIL OR HOSPITAL ID</p>
                <div className="border-[1.5px] rounded-md border-[#6B7C93] p-[10px] text-sm flex items-center border-[#76777D]">
                <input
                    type="email"
                    placeholder="e.g. dr.patel@hospital.org or +1 (555) 000-0000"
                    className="w-full py-1 px-2 outline-none bg-transparent"
                    {...register("email", {
                    required: "This field is required",
                    })}
                />
                </div>
                <div className="bg-[#EEF4FF] p-4 mt-6 flex flex-col items-start gap-2">
                    <p className="font-medium text-primary text-[16px] flex items-center gap-2">
                        <LucideAlertTriangle className="size-6" />
                        Active Shift Emergency Override
                    </p>
                    <p className="text-[8px] sm:text-[10px] lg:text-[12px] text-primary">
                        For immediate diagnostic access during critical clinical procedures, do
                        not wait for automated email delivery. Contact Hospital Biomedical IT
                        or dial EXT 4400 for instant biometric verification.</p>
                </div>

            </>
            )}

            {(!isResetMode || isNewPasswordStage) && (
            <>
                <div className="flex flex-row justify-between items-center pt-6 lg:pt-8">
                <p className="text-[12px] sm:text-[13px] lg:text-[14px] uppercase text-primary">
                    {isResetMode ? "Create New Password" : "Password"}
                </p>
                {!isResetMode && (
                    <button
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    className="text-neutral text-[12px] sm:text-[13px] lg:text-[14px] hover:underline"
                    >
                    Forgot Password?
                    </button>
                )}
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
            </>
            )}

            {isNewPasswordStage && (
            <>
                <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] uppercase text-primary">Confirm New Password</p>
                <div
                className={`border-[1.5px] rounded-md border-[#6B7C93] p-[10px] flex items-center ${
                    errors?.confirmPassword
                    ? "border-red-500"
                    : "border-[#76777D]"
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
            </>
            )}

            <button
            className="text-white bg-[#1F3A5F] cursor-pointer mt-6 lg:mt-[30px] border-[1.5px] rounded-md border-[#6B7C93] border-[#1F3A5F] w-full py-4 disabled:bg-[#6B7C93] disabled:border-[#6B7C93] disabled:cursor-not-allowed"
            disabled={isSubmitting}
            >
            {isResetMode ? (isSubmitting ? "Sending link..." : "Proceed") : isSubmitting ? "Signing in..." : "Sign In ⟶"}
            </button>

            {isResetMode && (
            <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="text-xs font-medium text-primary flex justify-left align-left mt-4 mb-10 hover:underline cursor-pointer uppercase"
            >
                ⟵ Return to Sign in
            </button>
            )}

            {!isResetMode && (
            <div className="border-t border-[#C6C6CD99] mt-6 pt-6 mb-6 text-center text-sm text-[#6B7C93]">
                Don&apos;t have an account?{" "}
                <button
                type="button"
                onClick={() => navigate("/sign-up")}
                className="text-primary font-medium hover:underline cursor-pointer"
                >
                Sign up
                </button>
            </div>
            )}
        </form>
        </div>
    </div>
    </div>


  );
};

export default Login;