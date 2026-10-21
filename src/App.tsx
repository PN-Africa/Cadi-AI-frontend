import {
  createBrowserRouter,
  Link,
  Navigate,
  Outlet,
  RouterProvider,
  useMatches,
  useOutletContext,
  useParams,
  type Params,
} from "react-router-dom";
import { LucideArrowLeft } from "lucide-react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminLogin from "./pages/AdminLogin";
import AdminVerify from "./pages/AdminVerify";
import ProtectedApp from "./auth/ProtectedApp";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import Patient from "./pages/Patient";
import PatientMonitoring from "./pages/PatientMonitoring";
import PatientActivity from "./pages/PatientActivity";
import ActivityDetails from "./pages/ActivityDetails";
import ResolveStatus from "./pages/ResolveStatus";
import EventResolved from "./pages/EventResolved";
import PatientHistory from "./pages/PatientHistory";
import Overview from "./pages/Overview";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

interface Crumb {
  label: string;
  to: string;
}

interface RouteHandle {
  crumbs?: (params: Params) => Crumb[];
}

const patientsCrumb: Crumb = { label: "Patients", to: "/patients" };
const activityCrumb = (p: Params): Crumb => ({
  label: "Activity Timeline",
  to: `/patient/${p.id}/activity`,
});
const eventCrumb = (p: Params): Crumb => ({
  label: "Event details",
  to: `/patient/${p.id}/activity/${encodeURIComponent(p.eventId ?? "")}`,
});

const Breadcrumbs = ({ padded = false }: { padded?: boolean }) => {
  const matches = useMatches();
  const leaf = [...matches].reverse().find((match) => (match.handle as RouteHandle | undefined)?.crumbs);

  if (!leaf) return null;

  const crumbs = (leaf.handle as RouteHandle).crumbs!(leaf.params);
  const parent = crumbs.length > 1 ? crumbs[crumbs.length - 2] : null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-[12px] sm:text-[13px] ${
        padded ? "px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8" : ""
      }`}
    >
      {parent && (
        <Link to={parent.to} aria-label={`Back to ${parent.label}`} className="shrink-0">
          <LucideArrowLeft className="size-4 text-primary" />
        </Link>
      )}

      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.to} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-[#6B7C93]">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className="text-[#1D4ED8] hover:underline">
                  {crumb.label}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-[#6B7C93]">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const WithBreadcrumbs = ({ padded = false }: { padded?: boolean }) => {
  const context = useOutletContext();

  return (
    <>
      <Breadcrumbs padded={padded} />
      <Outlet context={context} />
    </>
  );
};

const LegacyPatientRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/patient/${id}`} replace />;
};

const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    path: "/admin29-user",
    element: <AdminLogin />,
  },
  {
    path: "/admin-verify",
    element: <AdminVerify />,
  },

  {
    element: <ProtectedApp />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },

          {
            element: <WithBreadcrumbs padded />,
            children: [
              {
                path: "/patients",
                element: <PatientList />,
              },
              {
                path: "/patients/:id",
                element: <LegacyPatientRedirect />,
              },
            ],
          },
          {
            path: "/overview",
            element: <Overview />,
          },
          {
            path: "/notifications",
            element: <Notifications />,
          },{
            path: "/settings",
            element: <Settings />,
          },

          {
            path: "/patient/:id",
            element: <Patient />,
            children: [
              {
                element: <WithBreadcrumbs />,
                children: [
                  {
                    index: true,
                    element: <PatientMonitoring />,
                    handle: {
                      crumbs: (p) => [patientsCrumb, { label: "Monitoring", to: `/patient/${p.id}` }],
                    } satisfies RouteHandle,
                  },
                  {
                    path: "activity",
                    element: <PatientActivity />,
                    handle: {
                      crumbs: (p) => [patientsCrumb, activityCrumb(p)],
                    } satisfies RouteHandle,
                  },
                  {
                    path: "activity/:eventId",
                    element: <ActivityDetails />,
                    handle: {
                      crumbs: (p) => [activityCrumb(p), eventCrumb(p)],
                    } satisfies RouteHandle,
                  },
                  {
                    // Healthcare professionals only; the page enforces this itself
                    path: "activity/:eventId/resolve",
                    element: <ResolveStatus />,
                    handle: {
                      crumbs: (p) => [
                        activityCrumb(p),
                        eventCrumb(p),
                        { label: "Resolve status", to: `${eventCrumb(p).to}/resolve` },
                      ],
                    } satisfies RouteHandle,
                  },
                  {
                    path: "activity/:eventId/resolved",
                    element: <EventResolved />,
                    handle: {
                      crumbs: (p) => [
                        activityCrumb(p),
                        eventCrumb(p),
                        { label: "Event resolved", to: `${eventCrumb(p).to}/resolved` },
                      ],
                    } satisfies RouteHandle,
                  },
                  {
                    path: "activity/:eventId/history",
                    element: <PatientHistory />,
                    handle: {
                      crumbs: (p) => [patientsCrumb, { label: "History", to: `/patient/${p.id}/history` }],
                    } satisfies RouteHandle,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;