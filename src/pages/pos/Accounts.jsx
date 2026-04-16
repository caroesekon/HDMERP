import { useState, useEffect } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiSearch,
  HiCash, HiDocumentText, HiCreditCard, HiEye, HiPrinter, HiCheck, HiFilter,
  HiMail, HiRefresh
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import posAccountService from '../../services/posAccountService';
import InvoiceForm from '../../components/pos/InvoiceForm';
import WithdrawalForm from '../../components/pos/WithdrawalForm';
import AccountForm from '../../components/pos/AccountForm';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { printInvoice, printWithdrawalReceipt, printAccountStatement } from '../../utils/printUtils';

export default function POSAccounts() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState({ type: null, data: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewDetails, setViewDetails] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ open: false, invoice: null });
  const [selectedAccount, setSelectedAccount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [accRes, invRes, withRes] = await Promise.all([
        posAccountService.getAccounts(),
        posAccountService.getInvoices(),
        posAccountService.getWithdrawals()
      ]);
      setAccounts(accRes.data || []);
      setInvoices(invRes.data || []);
      setWithdrawals(withRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (type, id, name) => {
    if (!confirm(`Delete ${type} "${name}"?`)) return;
    try {
      if (type === 'account') await posAccountService.deleteAccount(id);
      else if (type === 'invoice') await posAccountService.deleteInvoice(id);
      toast.success(`${type} deleted`);
      fetchAllData(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleMarkAsPaidClick = (invoice) => {
    if (accounts.length === 0) {
      toast.error('No accounts available. Please create an account first.');
      return;
    }
    setPaymentModal({ open: true, invoice });
    setSelectedAccount(accounts.filter(a => a.isActive)[0]?._id || '');
  };

  const handleConfirmPayment = async () => {
    if (!selectedAccount) {
      toast.error('Please select an account to receive payment');
      return;
    }
    
    setProcessing(true);
    try {
      await posAccountService.markInvoiceAsPaid(paymentModal.invoice._id, {
        accountId: selectedAccount,
        paymentMethod
      });
      toast.success('Invoice marked as paid - Account credited');
      setPaymentModal({ open: false, invoice: null });
      await fetchAllData(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = (type, item) => {
    if (type === 'invoice') printInvoice(item);
    else if (type === 'withdrawal') printWithdrawalReceipt(item);
    else if (type === 'account') printAccountStatement(item);
  };

  const handleViewDetails = (type, item) => {
    setSelectedItem({ type, ...item });
    setViewDetails(true);
  };

  const handleSendEmail = async (invoice) => {
    if (!invoice.customerEmail) {
      toast.error('No customer email provided');
      return;
    }
    try {
      await posAccountService.sendInvoiceEmail(invoice._id, invoice);
      toast.success(`Invoice sent to ${invoice.customerEmail}`);
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  const handleSendWhatsApp = async (invoice) => {
    if (!invoice.customerPhone) {
      toast.error('No customer phone provided');
      return;
    }
    try {
      await posAccountService.sendInvoiceWhatsApp(invoice._id, invoice);
      toast.success(`Invoice sent to ${invoice.customerPhone} via WhatsApp`);
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  const handleFormSuccess = () => {
    setModal({ type: null, data: null });
    fetchAllData(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs = [
    { id: 'accounts', name: 'Accounts', icon: HiCash },
    { id: 'invoices', name: 'Invoices', icon: HiDocumentText },
    { id: 'withdrawals', name: 'Withdrawals', icon: HiCreditCard }
  ];

  // Filter data
  const filteredAccounts = accounts.filter(a => 
    !search || 
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.type?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInvoices = invoices.filter(i => {
    const matchesSearch = !search || 
      i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      i.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredWithdrawals = withdrawals.filter(w => 
    !search || 
    w.description?.toLowerCase().includes(search.toLowerCase()) ||
    w.reference?.toLowerCase().includes(search.toLowerCase()) ||
    w.accountId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate totals
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const pendingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + (i.total || 0), 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (i.total || 0), 0);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

  if (loading) return <Loader text="Loading..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Accounts & Finance</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchAllData(true)} loading={refreshing}>
            <HiRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {activeTab === 'accounts' && (
            <Button onClick={() => setModal({ type: 'account', data: null })}>
              <HiPlus className="mr-2" />Add Account
            </Button>
          )}
          {activeTab === 'invoices' && (
            <Button onClick={() => setModal({ type: 'invoice', data: null })}>
              <HiPlus className="mr-2" />Create Invoice
            </Button>
          )}
          {activeTab === 'withdrawals' && (
            <Button onClick={() => setModal({ type: 'withdrawal', data: null })}>
              <HiPlus className="mr-2" />Record Withdrawal
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <p className="text-sm text-blue-600">Total Balance</p>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalBalance)}</p>
          <p className="text-xs text-blue-500 mt-1">{filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <p className="text-sm text-purple-600">Total Invoiced</p>
          <p className="text-2xl font-bold text-purple-700">{formatCurrency(totalInvoiced)}</p>
          <p className="text-xs text-purple-500 mt-1">{filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <p className="text-sm text-orange-600">Outstanding</p>
          <p className="text-2xl font-bold text-orange-700">{formatCurrency(pendingInvoices)}</p>
          <p className="text-xs text-orange-500 mt-1">Paid: {formatCurrency(paidInvoices)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <p className="text-sm text-red-600">Total Withdrawn</p>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totalWithdrawn)}</p>
          <p className="text-xs text-red-500 mt-1">{filteredWithdrawals.length} withdrawal{filteredWithdrawals.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearch('');
                setStatusFilter('all');
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              <span className="ml-2 text-xs">
                ({tab.id === 'accounts' ? filteredAccounts.length : 
                  tab.id === 'invoices' ? filteredInvoices.length : filteredWithdrawals.length})
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder={`Search ${activeTab}...`}
              icon={<HiSearch />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {activeTab === 'invoices' && (
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}
          <Button variant="outline" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
            <HiFilter className="mr-1" />Reset
          </Button>
        </div>
      </div>

      {/* Accounts Table */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAccounts.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No accounts found</td></tr>
                ) : (
                  filteredAccounts.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{a.name}</td>
                      <td className="px-4 py-3 capitalize">{a.type}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${a.balance < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatCurrency(a.balance)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${a.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleViewDetails('account', a)} className="text-blue-600" title="View">
                            <HiEye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handlePrint('account', a)} className="text-purple-600" title="Print">
                            <HiPrinter className="h-4 w-4" />
                          </button>
                          <button onClick={() => setModal({ type: 'account', data: a })} className="text-green-600" title="Edit">
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete('account', a._id, a.name)} className="text-red-600" title="Delete">
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
        </div>
      )}

      {/* Invoices Table */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No invoices found</td></tr>
                ) : (
                  filteredInvoices.map(i => (
                    <tr key={i._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{i.invoiceNumber}</td>
                      <td className="px-4 py-3">{i.customerName || 'N/A'}</td>
                      <td className="px-4 py-3">{formatDate(i.invoiceDate)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(i.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(i.status)}`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-1">
                          <button onClick={() => handleViewDetails('invoice', i)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                            <HiEye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handlePrint('invoice', i)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" title="Print">
                            <HiPrinter className="h-4 w-4" />
                          </button>
                          {i.customerEmail && (
                            <button onClick={() => handleSendEmail(i)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Send Email">
                              <HiMail className="h-4 w-4" />
                            </button>
                          )}
                          {i.customerPhone && (
                            <button onClick={() => handleSendWhatsApp(i)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Send WhatsApp">
                              <FaWhatsapp className="h-4 w-4" />
                            </button>
                          )}
                          {i.status !== 'paid' && (
                            <button onClick={() => handleMarkAsPaidClick(i)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Receive Payment">
                              <HiCheck className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => setModal({ type: 'invoice', data: i })} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Edit">
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete('invoice', i._id, i.invoiceNumber)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
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
        </div>
      )}

      {/* Withdrawals Table */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Account</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredWithdrawals.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No withdrawals found</td></tr>
                ) : (
                  filteredWithdrawals.map(w => (
                    <tr key={w._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{formatDate(w.date)}</td>
                      <td className="px-4 py-3">{w.description}</td>
                      <td className="px-4 py-3">{w.accountId?.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(w.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => handleViewDetails('withdrawal', w)} className="text-blue-600" title="View">
                            <HiEye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handlePrint('withdrawal', w)} className="text-purple-600" title="Print">
                            <HiPrinter className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal.type === 'account' && (
        <AccountForm isOpen onClose={() => setModal({ type: null, data: null })} account={modal.data} onSuccess={handleFormSuccess} />
      )}
      {modal.type === 'invoice' && (
        <InvoiceForm isOpen onClose={() => setModal({ type: null, data: null })} invoice={modal.data} onSuccess={handleFormSuccess} />
      )}
      {modal.type === 'withdrawal' && (
        <WithdrawalForm isOpen onClose={() => setModal({ type: null, data: null })} withdrawal={modal.data} onSuccess={handleFormSuccess} />
      )}

      {/* Payment Modal */}
      <Modal isOpen={paymentModal.open} onClose={() => setPaymentModal({ open: false, invoice: null })} title="Receive Payment" size="md">
        {paymentModal.invoice && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Invoice #{paymentModal.invoice.invoiceNumber}</p>
              <p className="font-medium">{paymentModal.invoice.customerName}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(paymentModal.invoice.total)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit to Account <span className="text-red-500">*</span></label>
              <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="w-full border rounded-lg px-3 py-2" required>
                <option value="">Select Account</option>
                {accounts.filter(a => a.isActive).map(a => (
                  <option key={a._id} value={a._id}>{a.name} (Balance: {formatCurrency(a.balance)})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile Money</option>
                <option value="card">Card</option>
              </select>
            </div>
            
            {selectedAccount && (
              <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                <p>Account will be credited with {formatCurrency(paymentModal.invoice.total)}</p>
                <p className="text-xs mt-1">New balance: {formatCurrency((accounts.find(a => a._id === selectedAccount)?.balance || 0) + paymentModal.invoice.total)}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="secondary" onClick={() => setPaymentModal({ open: false, invoice: null })}>Cancel</Button>
              <Button onClick={handleConfirmPayment} loading={processing} disabled={!selectedAccount}>Confirm Payment</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={viewDetails} onClose={() => { setViewDetails(false); setSelectedItem(null); }} title={selectedItem?.type === 'invoice' ? 'Invoice Details' : selectedItem?.type === 'withdrawal' ? 'Withdrawal Details' : 'Account Details'} size="lg">
        {selectedItem && selectedItem.type === 'account' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
              <p className="text-gray-600">{selectedItem.description || 'No description'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Type</p><p className="font-medium capitalize">{selectedItem.type}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><span className={`px-2 py-1 text-xs rounded-full ${selectedItem.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedItem.isActive ? 'Active' : 'Inactive'}</span></div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-blue-600">Current Balance</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(selectedItem.balance)}</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => handlePrint('account', selectedItem)}><HiPrinter className="mr-2" />Print Statement</Button>
              <Button onClick={() => { setViewDetails(false); setSelectedItem(null); }}>Close</Button>
            </div>
          </div>
        )}
        {selectedItem && selectedItem.type === 'invoice' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <div><p className="text-sm text-gray-500">Invoice #</p><p className="font-mono font-medium">{selectedItem.invoiceNumber}</p></div>
                <div className="text-right"><p className="text-sm text-gray-500">Status</p><span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedItem.status)}`}>{selectedItem.status}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Customer</p><p className="font-medium">{selectedItem.customerName}</p></div>
              <div><p className="text-sm text-gray-500">Date</p><p className="font-medium">{formatDate(selectedItem.invoiceDate)}</p></div>
              <div><p className="text-sm text-gray-500">Due Date</p><p className="font-medium">{formatDate(selectedItem.dueDate)}</p></div>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(selectedItem.subtotal)}</span></div>
              {selectedItem.tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(selectedItem.tax)}</span></div>}
              <div className="flex justify-between font-bold text-lg mt-2"><span>Total</span><span>{formatCurrency(selectedItem.total)}</span></div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => handlePrint('invoice', selectedItem)}><HiPrinter className="mr-2" />Print</Button>
              <Button onClick={() => { setViewDetails(false); setSelectedItem(null); }}>Close</Button>
            </div>
          </div>
        )}
        {selectedItem && selectedItem.type === 'withdrawal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Date</p><p className="font-medium">{formatDate(selectedItem.date)}</p></div>
              <div><p className="text-sm text-gray-500">Account</p><p className="font-medium">{selectedItem.accountId?.name || 'N/A'}</p></div>
            </div>
            <div><p className="text-sm text-gray-500">Description</p><p className="font-medium">{selectedItem.description}</p></div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-sm text-red-600">Amount Withdrawn</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedItem.amount)}</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => handlePrint('withdrawal', selectedItem)}><HiPrinter className="mr-2" />Print</Button>
              <Button onClick={() => { setViewDetails(false); setSelectedItem(null); }}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}