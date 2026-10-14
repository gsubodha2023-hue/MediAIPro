import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// Usage in App.jsx:
// <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
//   <Route path="/patient/dashboard" element={<PatientDashboard />} />
// </Route>
export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
