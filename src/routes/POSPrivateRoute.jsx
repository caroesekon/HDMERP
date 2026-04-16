import { Navigate } from 'react-router-dom';
import { usePOSAuth } from '../context/POSAuthContext';

const POSPrivateRoute = ({ children }) => {
  const { user, loading } = usePOSAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/pos/login" replace />;
};

export default POSPrivateRoute;