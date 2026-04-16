import { useFinanceAuth as useAuth } from '../context/FinanceAuthContext';

export const useFinanceAuth = () => {
  return useAuth();
};