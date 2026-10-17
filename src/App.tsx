import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useParams,
} from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminLogin from "./pages/AdminLogin";
import AdminVerify from "./pages/AdminVerify";
import ProtectedApp from "./auth/ProtectedApp";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import Patient from "./pages/Patient";
// import PatientMonitoring from "./pages/PatientMonitoring";
import PatientActivity from "./pages/PatientActivity";

const LegacyPatientRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/patient/${id}`} replace />;
};

const router = createBrowserRouter([
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
            path: "/patients",
            element: <PatientList />,
          },
          {
            path: "/patient/:id",
            element: <Patient />,
            children: [
              // { index: true, element: <PatientMonitoring /> },
              { path: "activity", element: <PatientActivity /> },
            ],
          },
          {
            path: "/patients/:id",
            element: <LegacyPatientRedirect />,
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