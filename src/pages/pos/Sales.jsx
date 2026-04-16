import { useState, useEffect } from 'react';
import { HiPlus, HiEye, HiPrinter, HiSearch, HiReceiptRefund } from 'react-icons/hi';
import posService from '../../services/posService';
import SaleForm from '../../components/pos/SaleForm';
import SaleDetails from '../../components/pos/SaleDetails';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { printReceipt } from '../../utils/printUtils';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(sales);
    else {
      setFiltered(sales.filter(s => 
        s.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        s.customerId?.firstName?.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [sales, search]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await posService.getSales();
      setSales(res.data || []);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (id) => {
    if (!confirm('Process refund for this sale?')) return;
    try {
      await posService.refundSale(id, {});
      toast.success('Refund processed');
      fetchSales();
    } catch (error) {
      toast.error('Refund failed');
    }
  };

  const handlePrint = (sale) => {
    printReceipt(sale);
  };

  if (loading) return <Loader text="Loading sales..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sales</h2>
        <Button onClick={() => setModal({ type: 'add', data: null })}>
          <HiPlus className="mr-2" />New Sale
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <Input
          placeholder="Search invoice or customer..."
          icon={<HiSearch />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Invoice #</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-center">Items</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No sales found</td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.invoiceNumber}</td>
                  <td className="px-4 py-3">{formatDate(s.date)}</td>
                  <td className="px-4 py-3">{s.customerId?.firstName || 'Walk-in'}</td>
                  <td className="px-4 py-3 text-center">{s.items?.length || 0}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(s.grandTotal)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${s.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {s.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => setModal({ type: 'view', data: s })} className="text-blue-600" title="View">
                        <HiEye />
                      </button>
                      <button onClick={() => handlePrint(s)} className="text-purple-600" title="Print">
                        <HiPrinter />
                      </button>
                      {s.paymentStatus !== 'refunded' && (
                        <button onClick={() => handleRefund(s._id)} className="text-orange-600" title="Refund">
                          <HiReceiptRefund />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.type === 'add' && (
        <SaleForm isOpen onClose={() => setModal({ type: null })} onSuccess={fetchSales} />
      )}
      {modal.type === 'view' && (
        <SaleDetails sale={modal.data} onClose={() => setModal({ type: null })} />
      )}
    </div>
  );
}