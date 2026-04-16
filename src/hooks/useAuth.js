// This file is kept for backward compatibility
// Redirects to Hub auth by default
import { useHubAuth } from '../context/HubAuthContext';

export const useAuth = () => {
  return useHubAuth();
};