import { useState, useEffect } from 'react';
import { HiPlus, HiCheck, HiPrinter, HiFilter, HiSearch } from 'react-icons/hi';
import staffService from '../../services/staffService';
import PayrollForm from '../../components/staff/PayrollForm';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { printPayslip } from '../../utils/printUtils';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', month: '', search: '' });

  useEffect(() => {
    fetchPayrolls();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payrolls, filters]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await staffService.getAllPayrolls();
      setPayrolls(res.data || []);
    } catch (error) {
      toast.error('Failed to load payrolls');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payrolls];
    
    if (filters.status) {
      filtered = filtered.filter(p => p.paymentStatus === filters.status);
    }
    
    if (filters.month) {
      filtered = filtered.filter(p => {
        const startDate = p.period?.startDate;
        return startDate && startDate.startsWith(filters.month);
      });
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.staffId?.firstName?.toLowerCase().includes(search) ||
        p.staffId?.lastName?.toLowerCase().includes(search) ||
        p.staffId?.employeeId?.toLowerCase().includes(search)
      );
    }
    
    setFiltered(filtered);
  };

  const handleMarkPaid = async (id) => {
    try {
      await staffService.markAsPaid(id, { paymentMethod: 'bank' });
      toast.success('Marked as paid');
      fetchPayrolls();
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const handlePrint = async (payroll) => {
    try {
      const staffRes = await staffService.getStaff(payroll.staffId);
      printPayslip(payroll, staffRes.data);
    } catch (error) {
      toast.error('Could not load employee details');
    }
  };

  const resetFilters = () => {
    setFilters({ status: '', month: '', search: '' });
  };

  if (loading) return <Loader text="Loading payrolls..." />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Payroll Management</h2>
        <Button onClick={() => setModalOpen(true)}>
          <HiPlus className="mr-2 h-4 w-4" />
          Generate Payroll
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search Employee"
              icon={<HiSearch />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Name or Employee ID..."
            />
          </div>
          
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processed">Processed</option>
            </select>
          </div>
          
          <div className="w-40">
            <Input
              label="Month (YYYY-MM)"
              placeholder="2026-04"
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            />
          </div>
          
          <Button variant="outline" onClick={resetFilters}>
            <HiFilter className="mr-1 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No payroll records found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const totalAllowances = Object.values(p.allowances || {}).reduce((a, b) => a + b, 0);
                  const totalDeductions = Object.values(p.deductions || {}).reduce((a, b) => a + b, 0);
                  
                  return (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {p.staffId?.firstName} {p.staffId?.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{p.staffId?.employeeId}</div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-600">
                        {formatDate(p.period?.startDate)} - {formatDate(p.period?.endDate)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        {formatCurrency(p.basicSalary)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right text-green-600">
                        {formatCurrency(totalAllowances)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right text-red-600">
                        {formatCurrency(totalDeductions)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right font-semibold">
                        {formatCurrency(p.netSalary)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          p.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : p.paymentStatus === 'processed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex justify-end space-x-2">
                          {p.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(p._id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Mark as Paid"
                            >
                              <HiCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handlePrint(p)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Print Payslip"
                          >
                            <HiPrinter className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Showing {filtered.length} of {payrolls.length} payroll records
        </div>
      </div>

      {/* Payroll Form Modal */}
      <PayrollForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          fetchPayrolls();
        }}
      />
    </div>
  );
}