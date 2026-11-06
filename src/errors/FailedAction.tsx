import { useEffect } from "react";
import { Link, isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import { LucideAlertTriangle } from "lucide-react";

interface Details {
  code: string;
  title: string;
  body: string;
  detail: string;
  notFound: boolean;
}

const chunkError = /dynamically imported module|Loading chunk|Importing a module script failed/i;

const getDetails = (error: unknown): Details => {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        code: "404",
        title: "Page not found",
        body: "The page you're looking for doesn't exist or may have moved.",
        detail: "",
        notFound: true,
      };
    }
    return {
      code: String(error.status),
      title: error.statusText || "Request failed",
      body: "We couldn't complete that request. Please try again.",
      detail: typeof error.data === "string" ? error.data : "",
      notFound: false,
    };
  }

  const message = error instanceof Error ? error.message : "";

  if (chunkError.test(message)) {
    return {
      code: "",
      title: "A new version is available",
      body: "Reload the page to get the latest version of the app.",
      detail: "",
      notFound: false,
    };
  }

  return {
    code: "",
    title: "Something went wrong",
    body: "An unexpected error stopped this page from loading. Reloading usually fixes it.",
    detail: message,
    notFound: false,
  };
};

const primaryBtn =
  "cursor-pointer rounded-md bg-[#2563EB] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#1D4ED8]";
const secondaryBtn =
  "cursor-pointer rounded-md border border-[#C6C6CD99] bg-white px-5 py-2.5 text-[13px] text-primary hover:bg-[#F8F9FF]";

const FailedAction = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { code, title, body, detail, notFound } = getDetails(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8F9FF] p-4">
      <div
        role="alert"
        className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-[#C6C6CD99] bg-white p-8 text-center sm:p-10"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B91C1C]">
          <LucideAlertTriangle aria-hidden="true" className="size-6" />
        </span>

        {code && <p className="text-[32px] font-semibold leading-none text-[#1D4ED8]">{code}</p>}
        <h1 className="text-[18px] font-semibold text-primary sm:text-[20px]">{title}</h1>
        <p className="text-[13px] text-[#6B7C93] sm:text-[14px]">{body}</p>

        {import.meta.env.DEV && detail && (
          <pre className="max-h-32 w-full overflow-auto rounded-md bg-[#F8F9FF] p-3 text-left text-[11px] text-[#B91C1C]">
            {detail}
          </pre>
        )}

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {notFound ? (
            <>
              <Link to="/dashboard" className={primaryBtn}>
                Go to Dashboard
              </Link>
              <button type="button" onClick={() => navigate(-1)} className={secondaryBtn}>
                Go back
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => window.location.reload()} className={primaryBtn}>
                Reload page
              </button>
              <Link to="/dashboard" className={secondaryBtn}>
                Go to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default FailedAction;