import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type VerifyStatus = "verifying" | "success" | "error";

const AdminVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("verifying");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

//     const verifyToken = async () => {
//       try {
//         const res = await api.post("/admin/auth/verify-access", {
//           token,
//         });

//         setAuth({
//           user: {
//             email: res.data.admin.email,
//             name: res.data.admin.name,
//             role: res.data.admin.role,
//           },
//           token: res.data.token,
//         });

//         setStatus("success");
//         navigate("/admin-dashboard", { replace: true });
//       } catch (error) {
//         setStatus("error");
//         console.log(error);
//       }
//     };

//     verifyToken();
  }, [token, navigate]);

  return (
    <div className="bg-[#F8F9FF]">
      <div className="min-h-screen flex items-center justify-center px-4 py-6 lg:px-0 lg:py-10">
      <div className="border border-[#C6C6CD99] bg-white border-2 p-6 sm:p-8 lg:p-10">
        <div className="w-full md:w-[500px] flex flex-col items-center text-center">
            <div className="w-full items-center justify-center flex mb-4">
                <p className="font-bold text-[20px] sm:text-[22px] lg:text-[24px] text-primary md:mt-5">CADI AI</p>
            </div>

            {status === "verifying" && (
            <>
                <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary pt-6 sm:pt-8 lg:pt-10">
                Verifying your link
                </p>
                <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
                Hang tight while we confirm your admin sign-in link.
                </p>
            </>
            )}

            {status === "success" && (
            <>
                <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary pt-6 sm:pt-8 lg:pt-10">
                You're verified
                </p>
                <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
                Taking you to the admin dashboard...
                </p>
            </>
            )}

            {status === "error" && (
            <>
                <p className="font-semibold text-[18px] sm:text-[20px] lg:text-[22px] text-primary pt-6 sm:pt-8 lg:pt-10">
                This link is invalid or expired
                </p>
                <p className="text-[13px] sm:text-sm lg:text-[14px] text-[#6B7C93]">
                Request a new sign-in link to continue.
                </p>

                <button
                type="button"
                onClick={() => navigate("/admin29-user")}
                className="text-white bg-[#1F3A5F] cursor-pointer mt-6 lg:mt-[30px] border-[1.5px] rounded-md border-[#6B7C93] border-[#1F3A5F] w-full py-4"
                >
                Request new link ⟶
                </button>
            </>
            )}
        </div>
        </div>
    </div>
    </div>


  );
};

export default AdminVerify;