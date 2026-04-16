import { Navigate } from 'react-router-dom';
import { useStaffAuth } from '../context/StaffAuthContext';

const StaffPrivateRoute = ({ children }) => {
  const { user, loading } = useStaffAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/staff/login" replace />;
};

export default StaffPrivateRoute;