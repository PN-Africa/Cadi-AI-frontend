import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard';


  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/sign-up",
      element: <SignUp />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    }
  // {
  //   path: "/dashboard",
  //   element: <Layout />,
  //   errorElement: <ErrorFallback error={null} />,
  //   children: [
  //     {
  //       index: true,
  //       element: <Dashboard />,
  //       handle: { crumb: "Dashboard" },
  //     },
  //     {
  //       path: "users",
  //       element: <Users />,
  //       handle: { crumb: "Users" },
  //     },
  //     {
  //       path: "hykers",
  //       element: <Hykers />,
  //       handle: { crumb: "Hykers"}
  //     },
    
  //   ],
  // },
  // {
  //   path: "/pricing",
  //   element: <Layout />,
  //   errorElement: <ErrorFallback error={null} />,
  //   children: [
  //     {
  //       index: true,
  //       element: <Pricing />,
  //       handle: { crumb: "Pricing" },
  //     },
  //   ],
  // },
  // {
  //   path: "/landmarks",
  //   element: <Layout />,
  //   errorElement: <ErrorFallback error={null} />,
  //   children: [
  //     {
  //       index: true,
  //       element: <Landmarks />,
  //       handle: {crumb: "Landmarks"},
  //     },
  //     {
  //       path: "update",
  //       element: <UpdateLandmarks />,
  //       handle: {crumb: "Update a Landmark"}
  //     }
  //   ]
  // },
  // {
  //   path: "/user-management",
  //   element: <Layout />,
  //   errorElement: <ErrorFallback error={null} />,
  //   children: [
  //     {
  //       index: true,
  //       element: <UserManagement />,
  //       handle: {crumb: "User Management"},
  //     },
  //     {
  //       path: "add",
  //       element: <AddUser />,
  //       handle: {crumb: "User Management"},
  //     },
  //     {
  //       path: "edit-permissions",
  //       element: <EditPermissions />,
  //       handle: {crumb: "User Management"},
  //     }
  //   ]
  // },
  //   {
  //   path: "/hyker-management",
  //   element: <Layout />,
  //   errorElement: <ErrorFallback error={null} />,
  //   children: [
  //     {
  //       path: "dashboard",
  //       element: <HykerDashboard />,
  //       handle: {crumb: "Hyker Dashboard"},
  //     },
  //     {
  //       path: "candidates",
  //       element: <Candidates />,
  //       handle: {crumb: "Candidates"},
  //     },
  //     {
  //       path: "question-bank",
  //       element: <QuestionBank />,
  //       handle: {crumb: "Question Bank"},
  //     },
  //     {
  //       path: "video-scoring",
  //       element: <VideoScoring />,
  //       handle: {crumb: "Video Scoring"},
  //     },
  //     {
  //       path: "settings",
  //       element: <HykersSettings />,
  //       handle: {crumb: "Hyker Settings"},
  //     }
  //   ]
  // }
]);

  export default function App() {
  return (
      <RouterProvider router={router} />
  );
}
