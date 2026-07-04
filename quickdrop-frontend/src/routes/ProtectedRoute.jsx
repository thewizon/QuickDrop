import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
  roles = [],
}) {
  const {
    user,
    loading,
  } = useAuth();

  // Wait until AuthContext restores localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ea]">
        <p className="text-gray-600 text-lg">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    roles.length &&
    !roles.includes(user.role)
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
}