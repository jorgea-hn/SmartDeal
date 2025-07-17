import { ProtectedRoute } from "../components/Form";

function Adminviews() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome to the admin panel. Only admin users can see this content.</p>
      </div>
    </ProtectedRoute>
  );
}

export default Adminviews;