import { useState, useEffect } from 'react';
import { HiPrinter, HiRefresh } from 'react-icons/hi';
import financeService from '../../services/financeService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { printFinancialReport } from '../../utils/printUtils';

export default function FinanceReports() {
  const [profitLoss, setProfitLoss] = useState(null);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pl');
  const [period, setPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [plRes, bsRes, cfRes] = await Promise.allSettled([
        financeService.getProfitLoss({ startDate: period.startDate, endDate: period.endDate }),
        financeService.getBalanceSheet(),
        financeService.getCashFlow({ startDate: period.startDate, endDate: period.endDate })
      ]);

      if (plRes.status === 'fulfilled' && plRes.value.data) {
        setProfitLoss(plRes.value.data);
      }
      if (bsRes.status === 'fulfilled' && bsRes.value.data) {
        setBalanceSheet(bsRes.value.data);
      }
      if (cfRes.status === 'fulfilled' && cfRes.value.data) {
        setCashFlow(cfRes.value.data);
      }
    } catch (error) {
      console.error('Failed to load reports', error);
      toast.error('Failed to load some reports');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (activeTab === 'pl' && profitLoss) {
      printFinancialReport('Profit & Loss Statement', profitLoss, period);
    } else if (activeTab === 'bs' && balanceSheet) {
      printFinancialReport('Balance Sheet', balanceSheet, period);
    } else if (activeTab === 'cf' && cashFlow) {
      printFinancialReport('Cash Flow Statement', cashFlow, period);
    }
  };

  const handleQuickPeriod = (months) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    setPeriod({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  const tabs = [
    { id: 'pl', name: 'Profit & Loss' },
    { id: 'bs', name: 'Balance Sheet' },
    { id: 'cf', name: 'Cash Flow' }
  ];

  // Helper to safely format currency
  const safeFormat = (value) => {
    const num = Number(value);
    return isNaN(num) ? formatCurrency(0) : formatCurrency(num);
  };

  if (loading) return <Loader text="Loading reports..." size="lg" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReports}>
            <HiRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handlePrint}>
            <HiPrinter className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-4 items-end">
          <Input
            label="Start Date"
            type="date"
            value={period.startDate}
            onChange={(e) => setPeriod({ ...period, startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={period.endDate}
            onChange={(e) => setPeriod({ ...period, endDate: e.target.value })}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleQuickPeriod(1)}>1M</Button>
            <Button size="sm" variant="outline" onClick={() => handleQuickPeriod(3)}>3M</Button>
            <Button size="sm" variant="outline" onClick={() => handleQuickPeriod(6)}>6M</Button>
            <Button size="sm" variant="outline" onClick={() => handleQuickPeriod(12)}>1Y</Button>
          </div>
          <Button onClick={fetchReports}>Generate</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Profit & Loss */}
      {activeTab === 'pl' && profitLoss && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profit & Loss Statement</h3>
          <p className="text-sm text-gray-500 mb-4">
            Period: {formatDate(period.startDate)} - {formatDate(period.endDate)}
          </p>
          
          <div className="max-w-2xl space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Revenue</span>
              <span className="font-medium text-green-600">{safeFormat(profitLoss.revenue)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-t">
              <span className="text-gray-600">Cost of Goods Sold</span>
              <span className="font-medium">{safeFormat(profitLoss.cogs)}</span>
            </div>
            
            <div className="flex justify-between py-2 font-medium">
              <span>Gross Profit</span>
              <span className={(profitLoss.grossProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {safeFormat(profitLoss.grossProfit)}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-t">
              <span className="text-gray-600">Operating Expenses</span>
              <span className="font-medium text-red-600">{safeFormat(profitLoss.expenses)}</span>
            </div>
            
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Payroll Expenses</span>
              <span className="font-medium text-red-600">{safeFormat(profitLoss.payroll)}</span>
            </div>
            
            <div className="flex justify-between py-3 border-t-2 text-lg font-bold">
              <span>Net Profit</span>
              <span className={(profitLoss.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {safeFormat(profitLoss.netProfit)}
              </span>
            </div>
            
            <div className="flex justify-between py-2 text-sm text-gray-500">
              <span>Profit Margin</span>
              <span>{(profitLoss.profitMargin || 0).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Balance Sheet */}
      {activeTab === 'bs' && balanceSheet && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Balance Sheet</h3>
          <p className="text-sm text-gray-500 mb-4">As of: {formatDate(period.endDate)}</p>
          
          <div className="max-w-2xl space-y-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">ASSETS</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Total Assets</span>
                  <span className="font-medium text-green-600">{safeFormat(balanceSheet.assets)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">LIABILITIES</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Total Liabilities</span>
                  <span className="font-medium text-red-600">{safeFormat(balanceSheet.liabilities)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">EQUITY</h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Total Equity</span>
                  <span className="font-medium">{safeFormat(balanceSheet.equity)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between py-3 border-t-2 text-lg font-bold">
              <span>Total Liabilities & Equity</span>
              <span>{safeFormat((balanceSheet.liabilities || 0) + (balanceSheet.equity || 0))}</span>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow */}
      {activeTab === 'cf' && cashFlow && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cash Flow Statement</h3>
          <p className="text-sm text-gray-500 mb-4">
            Period: {formatDate(period.startDate)} - {formatDate(period.endDate)}
          </p>
          
          <div className="max-w-2xl space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Operating Cash Flow</span>
              <span className={`font-medium ${(cashFlow.operatingCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {safeFormat(cashFlow.operatingCashFlow)}
              </span>
            </div>
            
            <div className="flex justify-between py-3 border-t-2 text-lg font-bold">
              <span>Net Cash Flow</span>
              <span className={(cashFlow.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                {safeFormat(cashFlow.netCashFlow)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!loading && !profitLoss && !balanceSheet && !cashFlow && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">No report data available. Try adjusting the date range.</p>
        </div>
      )}
    </div>
  );
}