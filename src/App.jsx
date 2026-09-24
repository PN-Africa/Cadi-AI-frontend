import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from '../src/pages/Login.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    children: []
  }
])

export default function App() {

  return (
    <RouterProvider router={router} />
  )
}