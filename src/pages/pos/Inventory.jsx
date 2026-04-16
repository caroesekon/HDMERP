import { useState, useEffect } from 'react';
import { HiExclamation } from 'react-icons/hi';
import posService from '../../services/posService';
import InventoryAdjustForm from '../../components/pos/InventoryAdjustForm';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function Inventory() {
  const [movements, setMovements] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [movRes, lowRes] = await Promise.all([
        posService.getInventoryMovements(),
        posService.getLowStock()
      ]);
      setMovements(movRes.data || []);
      setLowStock(lowRes.data || []);
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading inventory..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <Button onClick={() => setModalOpen(true)}>Adjust Stock</Button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 flex items-center">
            <HiExclamation className="mr-2" />Low Stock Alert ({lowStock.length})
          </h3>
          <div className="mt-2 grid gap-2">
            {lowStock.map(p => (
              <div key={p._id} className="flex justify-between">
                <span>{p.name} ({p.sku})</span>
                <span className="font-bold text-red-600">{p.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold mb-4">Recent Stock Movements</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Quantity</th>
                <th className="px-4 py-2 text-left">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {movements.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No movements recorded</td></tr>
              ) : (
                movements.slice(0, 20).map(m => (
                  <tr key={m._id}>
                    <td className="px-4 py-2">{formatDate(m.date)}</td>
                    <td className="px-4 py-2">{m.productId?.name || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <span className={m.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                        {m.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">{m.quantity}</td>
                    <td className="px-4 py-2">{m.reason || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryAdjustForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}