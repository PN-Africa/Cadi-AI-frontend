import logo from "../assets/CADI AI Wireframe Logo.png";
import {useNavigate, useSearchParams } from "react-router-dom";
import {

  useForm,
} from "react-hook-form";
import { useState } from "react";
import { LucideAlertTriangle, LucideEye, LucideEyeClosed } from "lucide-react";
// import toast from "react-hot-toast";

type FormData = {
  email?: string;
  password: string;
  confirmPassword?: string;
};

const Login = () => {
  const { register, formState, watch } = useForm<FormData>();
  const { errors } = formState;

  const navigate = useNavigate();
//   const location = useLocation();
//   const from = location.state?.from?.pathname || "/dashboard";
//   const { setAuth } = useAuthStore();

  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [isSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
//   const [resetPassword, setResetPassword] = useState("");

  // OTP state

  const isResetEmailStage = isResetMode && !resetToken;
  const isNewPasswordStage = isResetMode && !!resetToken;

//   const onConfirmOtp = async () => {
//     const otpValue = otp.join("");
//     if (otpValue.length < 6) {
//       setOtpError("Please enter the full 6-digit OTP.");
//       return;
//     }
//     setIsSubmitting(true);
//     setOtpError("");
//     try {
//       await api.post("/admin/auth/reset-password", {
//         email: resetEmail,
//         otp: otpValue,
//         newPassword: resetPassword,
//       });
//       setIsOtpMode(false);
//       setIsResetMode(false);
//       setOtp(Array(6).fill(""));
//     } catch (error) {
//       setOtpError("Invalid or expired OTP. Please try again.");
//       console.log(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const onSubmit: SubmitHandler<FormData> = async (data) => {
//     setIsSubmitting(true);

//     try {
//       if (!isResetMode) {
//         const res = await axiosPrivate.post(`admin/auth/login`, {
//           email: data.email,
//           password: data.password,
//         });
//         console.log("Full response:", res);
//         console.log("res.data:", res.data);

//         setAuth({
//           user: {
//             email: res.data.admin.email,
//             name: res.data.admin.name,
//             role: res.data.admin.role,
//           },
//           token: res.data.token,
//         });
//         console.log(res.data.admin.name);
//         console.log(res.data.admin.role);

//         navigate(from, { replace: true });
//         console.log(from);

//       } else {
//         if (data.password !== data.confirmPassword) return;

//         await api.post("/admin/auth/request-password-reset", {
//           email: data.email,
//           password: data.password,
//         });
//         setResetPassword(data.password);
//         setResetEmail(data.email ?? "");
//         setIsOtpMode(true);
//       }
//     } catch (error) {
//       toast.error("Invalid Credentials.")
//       console.log(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const onError: SubmitErrorHandler<FormData> = (errors) => {
//     toast.error("Invalid Credentials.")
//     console.log(errors);
//   };

  return (
    <div className="bg-[#F8F9FF]">
      <div className="min-h-screen flex items-center justify-center px-4 py-6 lg:px-0 lg:py-10">
      <div className="border border-[#C6C6CD99] bg-white border-2 p-6 sm:p-8 lg:p-10">
        <div className="w-full items-center justify-center flex">
            <img className="h-8 sm:h-9 lg:h-10 w-auto" src={logo} alt="Cadi AI logo" />
        </div>

        <div className="w-full md:w-[500px] flex flex-col items-start pt-6 sm:pt-8 lg:pt-10">
            <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">
            {isResetMode ? "Reset Password" : "Sign In"}
            </p>
            {!isResetMode && (
            <p className="text-[13px] sm:text-sm lg:text-[14px] text-gray-500">
                Sign in to access patient telemetry and care alerts
            </p>
            )}
        </div>

        <form
            className="text-[14px] sm:text-[15px] lg:text-[16px] flex flex-col w-full md:w-[500px]"
        >
            {!isResetMode && (
            <>
                <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary uppercase">Email or Phone Number</p>
                <div
                className={`border-[1.5px] p-[10px] text-sm flex items-center ${
                    errors?.email ? "border-red-500" : "border-[#76777D]"
                }`}
                >
                <input
                    type="email"
                    placeholder="e.g. dr.patel@hospital.org or +1 (555) 000-0000"
                    className="w-full py-1 px-2 outline-none bg-transparent"
                    {...register("email", {
                    required: "This field is required",
                    })}
                />
                </div>
            </>
            )}

            {isResetEmailStage && (
            <>
                <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary">WORK EMAIL OR HOSPITAL ID</p>
                <div className="border-[1.5px] p-[10px] text-sm flex items-center border-[#76777D]">
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
                className={`border-[1.5px] p-[10px] text-sm flex items-center gap-2 ${
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
                className={`border-[1.5px] p-[10px] flex items-center ${
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
            className="text-white bg-black cursor-pointer mt-6 lg:mt-[30px] border-[1.5px] border-black w-full py-4 disabled:bg-grey-400 disabled:border-grey-500 disabled:cursor-not-allowed"
            disabled={isSubmitting} {...(!isResetMode ? { onClick: () => navigate("/dashboard") } : null)}
            >
            {isResetMode ? "Proceed" : "Sign In ⟶"}
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
            <div className="border-t border-[#C6C6CD99] mt-6 pt-6 mb-6 text-center text-sm text-gray-500">
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