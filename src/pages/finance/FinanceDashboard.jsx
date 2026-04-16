import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiTrendingUp, HiTrendingDown, HiCash, HiDocumentText, HiPlus,
  HiReceiptTax, HiChartPie, HiDatabase
} from 'react-icons/hi';
import financeService from '../../services/financeService';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import { useAppSettings } from '../../hooks/useAppSettings';

export default function FinanceDashboard() {
  const { appName } = useAppSettings('Finance Manager');
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netCashflow: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        financeService.getTransactionSummary({ period: 'month' }),
        financeService.getTransactions({ limit: 5 })
      ]);
      setSummary({
        totalIncome: summaryRes.data?.totalIncome || 0,
        totalExpense: summaryRes.data?.totalExpense || 0,
        netCashflow: summaryRes.data?.netCashflow || 0
      });
      setRecentTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Failed to load finance data', error);
    } finally { setLoading(false); }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{appName}</h2>
        <Link to="/finance/transactions" className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center">
          <HiPlus className="mr-2" />New Transaction
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={HiTrendingUp} label="Income (Month)" value={formatCurrency(summary.totalIncome)} color="bg-green-500" />
        <StatCard icon={HiTrendingDown} label="Expenses (Month)" value={formatCurrency(summary.totalExpense)} color="bg-red-500" />
        <StatCard icon={HiCash} label="Net Cashflow" value={formatCurrency(summary.netCashflow)} color={summary.netCashflow >= 0 ? 'bg-blue-500' : 'bg-orange-500'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink to="/finance/transactions" icon={HiDocumentText} label="Transactions" />
            <QuickLink to="/finance/expenses" icon={HiTrendingDown} label="Add Expense" />
            <QuickLink to="/finance/income" icon={HiTrendingUp} label="Add Income" />
            <QuickLink to="/finance/budget" icon={HiChartPie} label="Budget" />
            <QuickLink to="/finance/accounts" icon={HiDatabase} label="Accounts" />
            <QuickLink to="/finance/reports" icon={HiReceiptTax} label="Reports" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          {recentTransactions.length === 0 ? <p className="text-gray-500">No transactions</p> : (
            <div className="space-y-3">
              {recentTransactions.map(tx => (
                <div key={tx._id} className="flex justify-between border-b pb-2">
                  <div><p className="font-medium">{tx.description}</p><p className="text-xs text-gray-500">{tx.category}</p></div>
                  <p className={tx.amount < 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(tx.amount)}</p>
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
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center mr-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold">{value}</p></div>
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