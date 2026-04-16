import { useState, useEffect } from 'react';
import { HiPrinter } from 'react-icons/hi';
import posService from '../../services/posService';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { printProductList } from '../../utils/printUtils';
import toast from 'react-hot-toast';

export default function POSReports() {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, topRes] = await Promise.all([
        posService.getSalesReport({ groupBy: period }),
        posService.getTopProducts()
      ]);
      setSalesData(salesRes.data || []);
      setTopProducts(topRes.data || []);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintProducts = () => {
    if (topProducts.length === 0) return;
    const productsForPrint = topProducts.map(p => ({
      ...p,
      name: p.name || p._id?.name || 'Unknown'
    }));
    printProductList(productsForPrint);
  };

  if (loading) return <Loader text="Loading reports..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales Reports</h2>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <Button variant="outline" onClick={handlePrintProducts}>
            <HiPrinter className="mr-2" />Print Top Products
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Sales Trend</h3>
        <div className="h-64">
          {salesData.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No sales data available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Bar dataKey="totalSales" fill="#3b82f6" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-right">Quantity Sold</th>
                <th className="px-4 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topProducts.length === 0 ? (
                <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-500">No data available</td></tr>
              ) : (
                topProducts.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">{p.name || p._id}</td>
                    <td className="px-4 py-3 text-right">{p.totalQuantity || 0}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(p.totalRevenue || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}