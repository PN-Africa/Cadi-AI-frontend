import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminLogin from "./pages/AdminLogin";
import AdminVerify from "./pages/AdminVerify";
import ProtectedApp from "./auth/ProtectedApp";
import Dashboard from "./pages/Dashboard";
import PatientList from "./pages/PatientList";
import Patient from "./pages/Patient";

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
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/patients",
        element: <PatientList />,
      },
      {
        path: "/patients/:id",
        element: <Patient />,
      },


    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;