import { useNavigate } from "react-router-dom";
import {
//   type SubmitErrorHandler,
//   type SubmitHandler,
  useForm,
} from "react-hook-form";
import { useState } from "react";
// import toast from "react-hot-toast";
import logo from "../assets/CADI AI Wireframe Logo.png"

type FormData = {
  email: string;
};

const AdminLogin = () => {
  const { register, formState } = useForm<FormData>();
  const { errors } = formState;

  const navigate = useNavigate();

//   const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentEmail] = useState("");

//   const onSubmit: SubmitHandler<FormData> = async (data) => {
//     setIsSubmitting(true);

//     try {
//       await api.post("/admin/auth/request-access", {
//         email: data.email,
//       });

//       setSentEmail(data.email);
//       setIsSent(true);
//     } catch (error) {
//       // Intentionally show the same success state even on failure so we
//       // don't reveal whether an email belongs to a registered admin.
//       setSentEmail(data.email);
//       setIsSent(true);
//       console.log(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const onError: SubmitErrorHandler<FormData> = (errors) => {
//     toast.error("Please check the highlighted fields.")
//     console.log(errors);
//   };

  return (
    <div className="bg-[#F8F9FF]">
      <div className="min-h-screen flex items-center justify-center px-4 py-6 lg:px-0 lg:py-10">
      <div className="border border-[#C6C6CD99] bg-white border-2 p-6 sm:p-8 lg:p-10">
        <div className="w-full md:w-[500px] flex flex-col items-start">
            <div className="w-full items-center justify-center flex mb-4">
                <img className="h-8 sm:h-9 lg:h-10 w-auto" src={logo} alt="Hykers logo" />
            </div>

            {!isSent ? (
            <>
                <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">Admin Access</p>
                <p className="text-[13px] sm:text-sm lg:text-[14px] text-gray-500">
                Enter your registered admin email.
                </p>
            </>
            ) : (
            <>
                <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary">Check your email</p>
                <p className="text-[13px] sm:text-sm lg:text-[14px] text-gray-500">
                If <span className="text-primary font-medium">{sentEmail}</span> is a registered admin account, a secure sign-in link has been sent to it. The link expires shortly, so open it soon.
                </p>
            </>
            )}
        </div>

        {!isSent && (
        <form
            className="text-[14px] sm:text-[15px] lg:text-[16px] flex flex-col w-full md:w-[500px]"
        >
            <p className="pt-6 sm:pt-8 lg:pt-10 text-[12px] sm:text-[13px] lg:text-[14px] text-primary uppercase">Admin Email</p>
            <div
            className={`border-[1.5px] p-[10px] text-sm flex items-center ${
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
            className="text-white bg-black cursor-pointer mt-6 lg:mt-[30px] border-[1.5px] border-black w-full py-4 disabled:bg-grey-400 disabled:border-grey-500 disabled:cursor-not-allowed"
            // disabled={isSubmitting}
            >
                Proceed ⟶
            {/* {isSubmitting ? "Sending link..." : "Proceed ⟶"} */}
            </button>

            <div className="border-t border-[#C6C6CD99] mt-6 pt-6 mb-6 text-center text-sm text-gray-500">
            <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary font-medium hover:underline cursor-pointer"
            >
                ⟵ Back to Sign in
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

            <div className="border-t border-[#C6C6CD99] mt-6 pt-6 mb-6 text-center text-sm text-gray-500">
            <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary font-medium hover:underline cursor-pointer"
            >
                Back to Sign in
            </button>
            </div>
        </div>
        )}
        </div>
    </div>
    </div>


  );
};

export default AdminLogin;