import { useStaffAuth as useAuth } from '../context/StaffAuthContext';

export const useStaffAuth = () => {
  return useAuth();
};