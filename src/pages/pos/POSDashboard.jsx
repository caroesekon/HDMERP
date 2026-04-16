import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiCube, HiShoppingBag, HiUsers, HiChartBar,
  HiTrendingUp, HiCash, HiClipboardList
} from 'react-icons/hi';
import posService from '../../services/posService';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

export default function POSDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    todaySales: 0,
    monthSales: 0,
    customers: 0,
    lowStock: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, salesRes, customersRes, lowStockRes] = await Promise.allSettled([
        posService.getProducts(),
        posService.getSales(),
        posService.getCustomers(),
        posService.getLowStock()
      ]);

      // Products count
      const productsCount = productsRes.status === 'fulfilled' 
        ? (productsRes.value.count || productsRes.value.data?.length || 0) 
        : 0;

      // Sales data
      let todaySalesTotal = 0;
      let monthSalesTotal = 0;
      let recentSalesList = [];
      if (salesRes.status === 'fulfilled' && salesRes.value.data) {
        const sales = salesRes.value.data;
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        
        todaySalesTotal = sales
          .filter(s => s.date?.startsWith(today))
          .reduce((sum, s) => sum + (s.grandTotal || 0), 0);
        
        monthSalesTotal = sales
          .filter(s => s.date >= monthStart)
          .reduce((sum, s) => sum + (s.grandTotal || 0), 0);
        
        recentSalesList = sales.slice(0, 5);
      }

      // Customers count
      const customersCount = customersRes.status === 'fulfilled' 
        ? (customersRes.value.count || customersRes.value.data?.length || 0) 
        : 0;

      // Low stock count
      const lowStockCount = lowStockRes.status === 'fulfilled' 
        ? (lowStockRes.value.count || lowStockRes.value.data?.length || 0) 
        : 0;

      setStats({
        products: productsCount,
        todaySales: todaySalesTotal,
        monthSales: monthSalesTotal,
        customers: customersCount,
        lowStock: lowStockCount
      });
      setRecentSales(recentSalesList);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">POS Dashboard</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={HiCube} label="Products" value={stats.products} color="bg-blue-500" />
        <StatCard icon={HiCash} label="Today's Sales" value={formatCurrency(stats.todaySales)} color="bg-green-500" />
        <StatCard icon={HiTrendingUp} label="Month Sales" value={formatCurrency(stats.monthSales)} color="bg-purple-500" />
        <StatCard icon={HiUsers} label="Customers" value={stats.customers} color="bg-orange-500" />
        <StatCard icon={HiChartBar} label="Low Stock" value={stats.lowStock} color={stats.lowStock > 0 ? 'bg-red-500' : 'bg-gray-500'} />
      </div>

      {/* Quick Actions & Recent Sales */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink to="/pos/products" icon={HiCube} label="Products" />
            <QuickLink to="/pos/categories" icon={HiClipboardList} label="Categories" />
            <QuickLink to="/pos/customers" icon={HiUsers} label="Customers" />
            <QuickLink to="/pos/inventory" icon={HiChartBar} label="Inventory" />
            <QuickLink to="/pos/reports" icon={HiTrendingUp} label="Reports" />
            <QuickLink to="/pos/sales" icon={HiShoppingBag} label="All Sales" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Sales</h3>
            <Link to="/pos/sales" className="text-sm text-blue-600 hover:underline">View All</Link>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map(sale => (
                <div key={sale._id} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{sale.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{sale.customerId?.firstName || 'Walk-in'}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(sale.grandTotal)}</p>
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
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
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