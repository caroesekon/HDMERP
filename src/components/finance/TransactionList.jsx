import { useState, useEffect } from 'react';
import financeService from '../../services/financeService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Loader from '../common/Loader';

export default function TransactionList({ limit = 10 }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeService.getTransactions({ limit })
      .then(res => setTransactions(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) return <Loader />;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
      </div>
      <div className="divide-y">
        {transactions.map((tx) => (
          <div key={tx._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
            <div>
              <p className="font-medium">{tx.description}</p>
              <p className="text-xs text-gray-500">{formatDate(tx.date)} · {tx.type}</p>
            </div>
            <p className={`font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(tx.amount)}
            </p>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="p-4 text-center text-gray-500">No transactions yet</p>
        )}
      </div>
    </div>
  );
}