import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import posService from '../../services/posService';
import Loader from '../common/Loader';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    posService.getSales({ limit: 10 })
      .then(res => setSales(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading sales..." />;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Recent Sales</h3>
      <div className="space-y-2">
        {sales.length === 0 ? (
          <p className="text-gray-500 text-sm">No sales yet</p>
        ) : (
          sales.map((sale) => (
            <div key={sale._id} className="flex justify-between items-center border-b pb-2 text-sm">
              <div>
                <p className="font-medium">{sale.invoiceNumber}</p>
                <p className="text-xs text-gray-500">{formatDate(sale.date, 'datetime')}</p>
              </div>
              <p className="font-semibold">{formatCurrency(sale.grandTotal)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}