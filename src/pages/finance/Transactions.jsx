import { useState, useEffect } from 'react';
import {
  HiPlus, HiSearch, HiPrinter, HiFilter, HiPencil, HiTrash, HiEye,
  HiDownload, HiDocumentText
} from 'react-icons/hi';
import financeService from '../../services/financeService';
import TransactionForm from '../../components/finance/TransactionForm';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { printTransactionReceipt } from '../../utils/printUtils';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: null, data: null });
  const [viewDetails, setViewDetails] = useState({ open: false, data: null });
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await financeService.getTransactions({ limit: 200 });
      setTransactions(res.data || []);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];
    
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.category) {
      filtered = filtered.filter(t => 
        t.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(search) ||
        t.transactionId?.toLowerCase().includes(search) ||
        t.reference?.toLowerCase().includes(search)
      );
    }
    
    setFiltered(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction? This action cannot be undone.')) return;
    try {
      await financeService.deleteTransaction(id);
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handlePrint = (transaction) => {
    printTransactionReceipt(transaction);
  };

  const handlePrintAll = () => {
    if (filtered.length === 0) {
      toast.error('No transactions to print');
      return;
    }
    // Print all filtered transactions
    const content = generateTransactionsPrintContent(filtered, filters);
    printContent(content, 'Transactions Report');
  };

  const generateTransactionsPrintContent = (transactions, filters) => {
    const rows = transactions.map(t => `
      <tr>
        <td>${formatDate(t.date)}</td>
        <td>${t.transactionId}</td>
        <td>${t.description}</td>
        <td>${t.category || '-'}</td>
        <td>${t.type}</td>
        <td style="color: ${t.amount < 0 ? '#dc2626' : '#16a34a'};">${formatCurrency(t.amount)}</td>
      </tr>
    `).join('');
    
    return `
      <h2>Transactions Report</h2>
      <p>Filters: ${filters.type || 'All'} | ${filters.startDate || ''} - ${filters.endDate || ''}</p>
      <table border="1" cellpadding="8" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th>Date</th><th>Transaction ID</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  const printContent = (content, title) => {
    const win = window.open('', '_blank', 'width=800,height=600');
    win.document.write(`
      <html><head><title>${title}</title>
      <style>body{font-family:Arial,sans-serif;margin:20px} table{width:100%} th{background:#f3f4f6}</style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 250);
  };

  const resetFilters = () => {
    setFilters({ type: '', category: '', startDate: '', endDate: '', search: '' });
  };

  const getTypeBadge = (type) => {
    const badges = {
      sale: 'bg-green-100 text-green-800',
      income: 'bg-green-100 text-green-800',
      expense: 'bg-red-100 text-red-800',
      salary: 'bg-orange-100 text-orange-800',
      refund: 'bg-yellow-100 text-yellow-800',
      transfer: 'bg-blue-100 text-blue-800',
      payment: 'bg-purple-100 text-purple-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  // Calculate summary
  const totalIncome = filtered
    .filter(t => t.type === 'sale' || t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = filtered
    .filter(t => t.type === 'expense' || t.type === 'salary' || t.type === 'payment')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading) return <Loader text="Loading transactions..." />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintAll} disabled={filtered.length === 0}>
            <HiPrinter className="mr-2 h-4 w-4" />
            Print All
          </Button>
          <Button onClick={() => setModal({ type: 'add', data: null })}>
            <HiPlus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-500">Net</p>
          <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              icon={<HiSearch />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Description, ID, Reference..."
            />
          </div>
          
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="sale">Sale</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="salary">Salary</option>
              <option value="transfer">Transfer</option>
              <option value="refund">Refund</option>
            </select>
          </div>
          
          <div className="w-36">
            <Input
              label="Category"
              placeholder="Category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </div>
          
          <div className="w-36">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          
          <div className="w-36">
            <Input
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          
          <Button variant="outline" onClick={resetFilters}>
            <HiFilter className="mr-1 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <HiDocumentText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition">
                    <td className="px-3 sm:px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-mono text-xs text-gray-500">
                      {tx.transactionId?.slice(-8) || '-'}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{tx.description}</p>
                        {tx.reference && (
                          <p className="text-xs text-gray-500">Ref: {tx.reference}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-gray-600 hidden md:table-cell">
                      {tx.category || '-'}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-3 sm:px-4 py-3 text-right font-medium whitespace-nowrap ${
                      tx.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex justify-center space-x-1">
                        <button
                          onClick={() => setViewDetails({ open: true, data: tx })}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <HiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(tx)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Print Receipt"
                        >
                          <HiPrinter className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setModal({ type: 'edit', data: tx })}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 flex justify-between">
          <span>Showing {filtered.length} of {transactions.length} transactions</span>
          <span>Total: {formatCurrency(totalIncome - totalExpense)}</span>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {modal.type && (
        <TransactionForm
          isOpen={true}
          onClose={() => setModal({ type: null, data: null })}
          transaction={modal.data}
          onSuccess={() => {
            setModal({ type: null, data: null });
            fetchTransactions();
          }}
        />
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={viewDetails.open}
        onClose={() => setViewDetails({ open: false, data: null })}
        title="Transaction Details"
        size="md"
      >
        {viewDetails.data && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-mono font-medium">{viewDetails.data.transactionId}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(viewDetails.data.date, 'datetime')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(viewDetails.data.type)}`}>
                  {viewDetails.data.type}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{viewDetails.data.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{viewDetails.data.category || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{viewDetails.data.paymentMethod || '-'}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Amount</p>
              <p className={`text-2xl font-bold ${viewDetails.data.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(viewDetails.data.amount)}
              </p>
            </div>
            
            {viewDetails.data.reference && (
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-medium">{viewDetails.data.reference}</p>
              </div>
            )}
            
            {viewDetails.data.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-600">{viewDetails.data.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => handlePrint(viewDetails.data)}>
                <HiPrinter className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button onClick={() => setViewDetails({ open: false, data: null })}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}