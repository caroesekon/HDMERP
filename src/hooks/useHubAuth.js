import { useHubAuth as useAuth } from '../context/HubAuthContext';

export const useHubAuth = () => {
  return useAuth();
};