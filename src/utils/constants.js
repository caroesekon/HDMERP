export const APP_NAME = 'ERP Hub';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  USER: 'user'
};

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'bank', label: 'Bank Transfer' }
];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day'
};

export const LEAVE_TYPES = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' }
];

export const TRANSACTION_TYPES = {
  SALE: 'sale',
  EXPENSE: 'expense',
  SALARY: 'salary',
  REFUND: 'refund'
};