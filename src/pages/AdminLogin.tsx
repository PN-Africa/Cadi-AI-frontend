import { useNavigate } from "react-router-dom";
import {
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import { useState } from "react";
import { LucideEye, LucideEyeClosed } from "lucide-react";
import toast from "react-hot-toast";
import {
  requestAdminMagicLink,
  signInAdmin,
  type AdminLoginPayload,
  type AdminSignInPayload,
} from "../services/apiAdminLogin";
import { useAuthStore } from "../auth/auth";

type FormData = {
  email: string;
};

type SignInFormData = {
  email: string;
  password: string;
};

const AdminMagicLink = ({ onBack }: { onBack: () => void }) => {
  const { register, formState, handleSubmit } = useForm<FormData>();
  const { errors } = formState;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);

    try {
      const payload: AdminLoginPayload = {
        email: data.email,
      };

      await requestAdminMagicLink(payload);

      setSentEmail(data.email);
      setIsSent(true);
    } catch (error) {
      setSentEmail(data.email);
      setIsSent(true);
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
    <>
        <div className="w-full md:w-[500px] flex flex-col items-start">
            <div className="w-full items-center justify-center flex mb-4">
                <p className="font-bold text-[20px] sm:text-[22px] lg:text-[24px] text-primary md:mt-5">CADI AI</p>
            </div>

            {!isSent ? (
            <>
                <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">Admin Access</p>
                <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
                Enter your registered admin email.
                </p>
            </>
            ) : (
            <>
                <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">Check your email</p>
                <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
                If <span className="text-primary font-medium">{sentEmail}</span> is a registered admin account, a secure sign-in link has been sent to it. The link expires shortly, so open it soon.
                </p>
            </>
            )}
        </div>

        {!isSent && (
        <form
            className="text-[14px] sm:text-[15px] lg:text-[16px] flex flex-col w-full md:w-[500px]"
            onSubmit={handleSubmit(onSubmit, onError)}
        >
            <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary uppercase">Admin Email</p>
            <div
            className={`border-[1.5px] rounded-md border-[#6B7C93] p-[10px] text-sm flex items-center ${
                errors?.email ? "border-red-500" : "border-[#76777D]"
            }`}
            >
            <input
                type="email"
                placeholder="e.g. admin@cadiai.com"
                className="w-full py-1 px-2 outline-none bg-transparent"
                {...register("email", {
                required: "This field is required",
                })}
            />
            </div>

            <button
            className="text-white bg-[#1D4ED8] cursor-pointer mt-6 lg:mt-[30px] border-[1.5px] rounded-md border-[#6B7C93] border-[#3B82F6] w-full py-4 disabled:bg-[#6B7C93] disabled:border-[#6B7C93] disabled:cursor-not-allowed"
            disabled={isSubmitting}
            >
                {isSubmitting ? "Sending link..." : "Proceed"}
            </button>

            <div className="border-t border-[#C6C6CD99] mt-6 pt-6 mb-6 text-center text-sm text-[#6B7C93]">
            <button
                type="button"
                onClick={onBack}
                className="text-primary font-medium hover:underline cursor-pointer"
            >
                 Back to Sign in
            </button>
            </div>
        </form>
        )}

        {isSent && (
        <div className="w-full md:w-[500px] flex flex-col pt-6 sm:pt-8 lg:pt-10">
            <button
            type="button"
            onClick={() => setIsSent(false)}
            className="text-xs font-medium text-primary flex justify-left align-left hover:underline cursor-pointer uppercase"
            >
            ⟵ Use a different email
            </button>

            <div className="border-t border-[#C6C6CD99] mt-6 pt-6 mb-6 text-center text-sm text-[#6B7C93]">
            <button
                type="button"
                onClick={onBack}
                className="text-[#3B82F6] font-medium hover:underline cursor-pointer"
            >
                Back to Sign in
            </button>
            </div>
        </div>
        )}
    </>
  );
};

// Regular admin sign-in with the email + password that were verified and saved as an admin.
const AdminSignIn = ({ onVerify }: { onVerify: () => void }) => {
  const { register, formState, handleSubmit } = useForm<SignInFormData>();
  const { errors } = formState;

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    setIsSubmitting(true);

    try {
      const payload: AdminSignInPayload = {
        email: data.email.trim(),
        password: data.password,
      };

      const session = await signInAdmin(payload);

      setAuth({
        user: session.user,
        token: session.token,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error("Invalid Credentials.");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError: SubmitErrorHandler<SignInFormData> = (errors) => {
    toast.error("Please check the highlighted fields.");
    console.log(errors);
  };

  return (
    <>
        <div className="w-full md:w-[500px] flex flex-col items-start">
            <div className="w-full items-center justify-center flex mb-4">
                <p className="font-bold text-[20px] sm:text-[22px] lg:text-[24px] text-primary md:mt-5">CADI AI</p>
            </div>

            <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">Admin Sign In</p>
            <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
            Sign in with your verified admin email and password.
            </p>
        </div>

        <form
            className="text-[14px] sm:text-[15px] lg:text-[16px] flex flex-col w-full md:w-[500px]"
            onSubmit={handleSubmit(onSubmit, onError)}
        >
            <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary uppercase">Admin Email</p>
            <div
            className={`border-[1.5px] rounded-md border-[#6B7C93] p-[10px] text-sm flex items-center ${
                errors?.email ? "border-red-500" : "border-[#76777D]"
            }`}
            >
            <input
                type="email"
                autoComplete="username"
                placeholder="e.g. admin@cadiai.com"
                className="w-full py-1 px-2 outline-none bg-transparent"
                {...register("email", {
                required: "This field is required",
                })}
            />
            </div>

            <div className="flex items-start pt-6 lg:pt-8">
            <p className="text-[12px] sm:text-[13px] lg:text-[14px] uppercase text-primary">Password</p>
            </div>

            <div
            className={`border-[1.5px] rounded-md border-[#6B7C93] p-[10px] text-sm flex items-center gap-2 ${
                errors?.password ? "border-red-500" : "border-[#76777D]"
            }`}
            >
            <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="w-full py-1 px-2 outline-none bg-transparent"
                {...register("password", {
                required: "This field is required",
                })}
            />

            <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
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

            <div className="flex items-center justify-end mt-2">
            <button
                type="button"
                onClick={onVerify}
                className="text-[12px] text-[#3B82F6] sm:text-[13px] lg:text-[14px] hover:underline cursor-pointer"
            >
                First time here? Verify your admin email
            </button>
            </div>

            <button
            className="text-white bg-[#1D4ED8] cursor-pointer mt-6 lg:mt-[30px] border-[1.5px] rounded-md border-[#1D4ED8] w-full py-4 disabled:bg-[#6B7C93] disabled:border-[#6B7C93] disabled:cursor-not-allowed"
            disabled={isSubmitting}
            >
                {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="border-t border-[#C6C6CD99] mt-6 pt-6 mb-6 text-center text-sm text-[#6B7C93]">
            Not an admin?{" "}
            <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#3B82F6] font-medium hover:underline cursor-pointer"
            >
                Back to Sign in
            </button>
            </div>
        </form>
    </>
  );
};

type Mode = "signin" | "verify";

const AdminLogin = () => {
  const [mode, setMode] = useState<Mode>("signin");

  return (
    <div className="bg-[#F8F9FF]">
      <div className="min-h-screen flex items-center justify-center px-4 py-6 lg:px-0 lg:py-10">
      <div className="border border-[#C6C6CD99] bg-white border-2 p-6 sm:p-8 lg:p-10">
        {mode === "signin" ? (
          <AdminSignIn onVerify={() => setMode("verify")} />
        ) : (
          <AdminMagicLink onBack={() => setMode("signin")} />
        )}
        </div>
    </div>
    </div>


  );
};

export default AdminLogin;