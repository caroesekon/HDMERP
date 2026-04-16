import { Navigate } from 'react-router-dom';
import { useFinanceAuth } from '../context/FinanceAuthContext';

const FinancePrivateRoute = ({ children }) => {
  const { user, loading } = useFinanceAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to FINANCE login, not POS
  return user ? children : <Navigate to="/finance/login" replace />;
};

export default FinancePrivateRoute;