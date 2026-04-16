import { Routes, Route, Navigate } from 'react-router-dom';

// ==================== HUB (Public + Optional Profile) ====================
import Landing from '../pages/Landing';
import HubLogin from '../pages/auth/Login';
import HubRegister from '../pages/auth/Register';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import HubPrivateRoute from './HubPrivateRoute';

// ==================== POS SYSTEM ====================
import { POSAuthProvider } from '../context/POSAuthContext';
import POSPrivateRoute from './POSPrivateRoute';
import POSLogin from '../pages/pos/POSLogin';
import POSLayout from '../components/pos/POSLayout';
import POSDashboard from '../pages/pos/POSDashboard';
import Products from '../pages/pos/Products';
import Categories from '../pages/pos/Categories';
import Sales from '../pages/pos/Sales';
import Customers from '../pages/pos/Customers';
import Inventory from '../pages/pos/Inventory';
import POSAccounts from '../pages/pos/Accounts';
import POSReports from '../pages/pos/Reports';
import POSSettings from '../pages/pos/POSSettings';

// ==================== STAFF SYSTEM ====================
import { StaffAuthProvider } from '../context/StaffAuthContext';
import StaffPrivateRoute from './StaffPrivateRoute';
import StaffLogin from '../pages/staff/StaffLogin';
import StaffLayout from '../components/staff/StaffLayout';
import StaffDashboard from '../pages/staff/StaffDashboard';
import Employees from '../pages/staff/Employees';
import Departments from '../pages/staff/Departments';
import Attendance from '../pages/staff/Attendance';
import Payroll from '../pages/staff/Payroll';
import Leave from '../pages/staff/Leave';
import Performance from '../pages/staff/Performance';
import StaffSettings from '../pages/staff/StaffSettings';

// ==================== FINANCE SYSTEM ====================
import { FinanceAuthProvider } from '../context/FinanceAuthContext';
import FinancePrivateRoute from './FinancePrivateRoute';
import FinanceLogin from '../pages/finance/FinanceLogin';
import FinanceLayout from '../components/finance/FinanceLayout';
import FinanceDashboard from '../pages/finance/FinanceDashboard';
import Transactions from '../pages/finance/Transactions';
import Expenses from '../pages/finance/Expenses';
import Income from '../pages/finance/Income';
import Budget from '../pages/finance/Budget';
import Accounts from '../pages/finance/Accounts';
import FinanceReports from '../pages/finance/Reports';
import FinanceSettings from '../pages/finance/FinanceSettings';

const AppRoutes = () => {
  return (
    <Routes>
    
      {/* ==================== PUBLIC HUB ROUTES ==================== */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<HubLogin />} />
      <Route path="/register" element={<HubRegister />} />

      {/* ==================== HUB PROTECTED (Optional Profile) ==================== */}
      <Route element={<HubPrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* ==================== POS SYSTEM ==================== */}
      <Route path="/pos/*" element={
        <POSAuthProvider>
          <Routes>
            <Route path="login" element={<POSLogin />} />
            <Route path="*" element={
              <POSPrivateRoute>
                <POSLayout />
              </POSPrivateRoute>
            }>
              <Route index element={<POSDashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="sales" element={<Sales />} />
              <Route path="customers" element={<Customers />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="accounts" element={<POSAccounts />} />
              <Route path="reports" element={<POSReports />} />
              <Route path="settings" element={<POSSettings />} />
            </Route>
          </Routes>
        </POSAuthProvider>
      } />

      {/* ==================== STAFF SYSTEM ==================== */}
      <Route path="/staff/*" element={
        <StaffAuthProvider>
          <Routes>
            <Route path="login" element={<StaffLogin />} />
            <Route path="*" element={
              <StaffPrivateRoute>
                <StaffLayout />
              </StaffPrivateRoute>
            }>
              <Route index element={<StaffDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="departments" element={<Departments />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="leave" element={<Leave />} />
              <Route path="performance" element={<Performance />} />
              <Route path="settings" element={<StaffSettings />} />
            </Route>
          </Routes>
        </StaffAuthProvider>
      } />

      {/* ==================== FINANCE SYSTEM ==================== */}
      <Route path="/finance/*" element={
        <FinanceAuthProvider>
          <Routes>
            <Route path="login" element={<FinanceLogin />} />
            <Route path="*" element={
              <FinancePrivateRoute>
                <FinanceLayout />
              </FinancePrivateRoute>
            }>
              <Route index element={<FinanceDashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="income" element={<Income />} />
              <Route path="budget" element={<Budget />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="reports" element={<FinanceReports />} />
              <Route path="settings" element={<FinanceSettings />} />
            </Route>
          </Routes>
        </FinanceAuthProvider>
      } />

      {/* ==================== FALLBACK ==================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;