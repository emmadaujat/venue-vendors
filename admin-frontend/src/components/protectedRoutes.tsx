import { Navigate, Outlet, useLocation } from "react-router-dom";

// Checks sessionStorage for admin token
// If not logged in redirects to signin
export default function ProtectedRoutes() {
  const isLoggedIn = !!sessionStorage.getItem("admin_token");
  const location = useLocation();

  if (!isLoggedIn) {
    // Store where they were trying to go for post-auth routing
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Outlet renders the child route component
  return <Outlet />;
}
