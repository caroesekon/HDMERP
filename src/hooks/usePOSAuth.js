import { usePOSAuth as useAuth } from '../context/POSAuthContext';

export const usePOSAuth = () => {
  return useAuth();
};