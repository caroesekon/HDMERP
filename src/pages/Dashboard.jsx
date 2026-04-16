import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiShoppingCart, HiUsers, HiCurrencyDollar, HiExternalLink, HiCube, HiCash } from 'react-icons/hi';
import { useHubAuth } from '../context/HubAuthContext';  // FIXED: Changed from useAuth
import appService from '../services/appService';
import api from '../services/api';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';
import { formatCurrency } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useHubAuth();  // FIXED: Changed from useAuth
  const [externalApps, setExternalApps] = useState([]);
  const [stats, setStats] = useState({ 
    todaySales: 0,
    totalStaff: 0, 
    presentToday: 0,
    lowStock: 0,
    pendingPayroll: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const internalModules = [
    { name: 'POS', icon: HiShoppingCart, color: 'from-blue-500 to-blue-600', path: '/pos', description: 'Point of Sale' },
    { name: 'Staff', icon: HiUsers, color: 'from-green-500 to-green-600', path: '/staff', description: 'Manage employees' },
    { name: 'Finance', icon: HiCurrencyDollar, color: 'from-purple-500 to-purple-600', path: '/finance', description: 'Track money' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const appsRes = await appService.getAvailableApps().catch(() => ({ data: [] }));
      setExternalApps(appsRes.data || []);

      if (isAdminOrManager) {
        await fetchAdminStats();
      } else {
        setStats({
          todaySales: 0,
          totalStaff: 0,
          presentToday: 0,
          lowStock: 0,
          pendingPayroll: 0
        });
      }
      
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      setError('Some data could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    const newStats = { todaySales: 0, totalStaff: 0, presentToday: 0, lowStock: 0, pendingPayroll: 0 };
    
    try {
      const staffRes = await api.get('/staff').catch(() => ({ data: { count: 0 } }));
      newStats.totalStaff = staffRes.data?.count || 0;
      
      const attendanceRes = await api.get('/attendance/today').catch(() => ({ data: { present: 0 } }));
      newStats.presentToday = attendanceRes.data?.present || 0;
      
      const lowStockRes = await api.get('/pos/inventory/low-stock').catch(() => ({ data: { count: 0 } }));
      newStats.lowStock = lowStockRes.data?.count || 0;
      
      const payrollRes = await api.get('/payroll').catch(() => ({ data: [] }));
      const pending = payrollRes.data?.filter(p => p.paymentStatus === 'pending') || [];
      newStats.pendingPayroll = pending.length;
      
      const summaryRes = await api.get('/finance/transactions/summary', { params: { period: 'today' } }).catch(() => ({ data: { totalIncome: 0 } }));
      newStats.todaySales = summaryRes.data?.totalIncome || 0;
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setStats(newStats);
    }
  };

  const handleLaunchApp = async (app) => {
    try {
      const res = await appService.launchApp(app.appId);
      window.open(res.launchUrl, '_blank');
    } catch (error) {
      toast.error('Failed to launch app. Please check credentials.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader text="Loading dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}!</h2>
        <p className="text-primary-100 mt-1">
          Role: {user?.role || 'user'} 
          {!isAdminOrManager && <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">Limited Access</span>}
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          {error}
        </div>
      )}

      {isAdminOrManager && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={HiCurrencyDollar} 
            label="Today's Sales" 
            value={formatCurrency(stats.todaySales)} 
            color="bg-green-500" 
          />
          <StatCard 
            icon={HiUsers} 
            label="Present Today" 
            value={`${stats.presentToday}/${stats.totalStaff}`} 
            color="bg-blue-500" 
          />
          <StatCard 
            icon={HiCube} 
            label="Low Stock Items" 
            value={stats.lowStock} 
            color={stats.lowStock > 0 ? 'bg-red-500' : 'bg-orange-500'} 
          />
          <StatCard 
            icon={HiCash} 
            label="Pending Payroll" 
            value={stats.pendingPayroll} 
            color="bg-purple-500" 
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Core Systems</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {internalModules.map((module) => (
            <Link
              key={module.name}
              to={module.path}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
            >
              <div className={`bg-gradient-to-r ${module.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-md`}>
                <module.icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800 text-lg">{module.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{module.description}</p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-primary-600 text-sm font-medium">Open →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {externalApps.filter(app => app.isActive).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Connected Apps</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {externalApps.filter(app => app.isActive).map((app) => (
              <button
                key={app.appId}
                onClick={() => handleLaunchApp(app)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-left"
                style={{ borderLeftColor: app.color, borderLeftWidth: '4px' }}
              >
                <span className="text-3xl mb-2 block">{app.icon || '🔗'}</span>
                <h4 className="font-medium text-gray-800 text-sm truncate">{app.name}</h4>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <HiExternalLink className="h-3 w-3 mr-1" />
                  Launch
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center">
      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-sm`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}