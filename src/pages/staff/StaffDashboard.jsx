import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiUserGroup, HiClock, HiCash, HiCalendar, HiDocumentText, HiPrinter,
  HiTrendingUp, HiUsers, HiUserAdd, HiClipboardList
} from 'react-icons/hi';
import staffService from '../../services/staffService';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import { useAppSettings } from '../../hooks/useAppSettings';

export default function StaffDashboard() {
  const { appName } = useAppSettings('Staff Manager');
  const [stats, setStats] = useState({ total: 0, present: 0, onLeave: 0, payrollPending: 0 });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [staffRes, attendanceRes, payrollRes, leavesRes] = await Promise.all([
        staffService.getAllStaff(),
        staffService.getTodayAttendance(),
        staffService.getAllPayrolls(),
        staffService.getLeaves({ status: 'pending' })
      ]);
      const pendingPayroll = payrollRes.data?.filter(p => p.paymentStatus === 'pending') || [];
      setStats({
        total: staffRes.count || 0,
        present: attendanceRes.data?.present || 0,
        onLeave: leavesRes.data?.length || 0,
        payrollPending: pendingPayroll.length
      });
      setRecentAttendance(attendanceRes.data?.records?.slice(0, 5) || []);
      setPendingLeaves(leavesRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to load staff stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{appName}</h2>
        <Link to="/staff/employees" className="text-primary-600 hover:underline">View All →</Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={HiUserGroup} label="Total Staff" value={stats.total} color="bg-blue-500" />
        <StatCard icon={HiClock} label="Present Today" value={stats.present} color="bg-green-500" />
        <StatCard icon={HiCalendar} label="Pending Leave" value={stats.onLeave} color="bg-orange-500" />
        <StatCard icon={HiCash} label="Pending Payroll" value={stats.payrollPending} color="bg-purple-500" />
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <QuickLink to="/staff/employees" icon={HiUserAdd} label="Add Employee" />
            <QuickLink to="/staff/attendance" icon={HiClipboardList} label="Attendance" />
            <QuickLink to="/staff/payroll" icon={HiDocumentText} label="Generate Payroll" />
            <QuickLink to="/staff/leave" icon={HiCalendar} label="Approve Leave" />
            <QuickLink to="/staff/reports" icon={HiTrendingUp} label="Reports" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Pending Leave Requests</h3>
          {pendingLeaves.length === 0 ? (
            <p className="text-gray-500 text-sm">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map(leave => (
                <div key={leave._id} className="flex justify-between items-center">
                  <div><p className="font-medium">{leave.staffId?.firstName} {leave.staffId?.lastName}</p>
                    <p className="text-xs text-gray-500">{leave.leaveType} • {leave.daysCount} days</p>
                  </div>
                  <Link to="/staff/leave" className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full">Review</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center">
      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mr-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div><p className="text-sm text-gray-500">{label}</p><p className="text-xl font-bold">{value}</p></div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="p-3 bg-gray-50 rounded-lg text-center hover:bg-gray-100 transition">
      <Icon className="h-5 w-5 mx-auto mb-1 text-gray-600" />
      <span className="text-sm">{label}</span>
    </Link>
  );
}