// App.tsx - admin dashboard routes. Sign-in is public; everything else is wrapped
// in ProtectedRoute, which requires a stored admin token.

import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/signIn";
import Dashboard from "./pages/dashboard";
import Venues from "./pages/venues";
import Reports from "./pages/reports";
import ProtectedRoute from "./components/protectedRoutes";
import AddVenue from "./pages/addVenue";
import ManageVenue from "./pages/manageVenue";

function App() {
  return (
    <Routes>
      {/* Public route */}
      {/* Default route redirects to sign in */}
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/addVenue" element={<AddVenue />} />
        <Route path="/manageVenue/:venueId" element={<ManageVenue />} />
      </Route>
    </Routes>
  );
}

export default App;
