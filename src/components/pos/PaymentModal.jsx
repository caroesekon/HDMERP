import { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/helpers';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'bank', label: 'Bank Transfer' }
];

export default function PaymentModal({ isOpen, onClose, total, onConfirm }) {
  const [method, setMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(false);

  const change = amountPaid ? parseFloat(amountPaid) - total : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(amountPaid) < total) {
      alert('Insufficient amount');
      return;
    }
    setLoading(true);
    await onConfirm({ paymentMethod: method, amountPaid: parseFloat(amountPaid) });
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(total)}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`p-2 border rounded-lg text-sm capitalize ${
                  method === m.value 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        
        <Input
          label="Amount Received"
          type="number"
          step="0.01"
          value={amountPaid}
          onChange={e => setAmountPaid(e.target.value)}
          placeholder="Enter amount"
          required
        />
        
        {amountPaid && (
          <div className="flex justify-between text-sm">
            <span>Change:</span>
            <span className={`font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(change)}
            </span>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Complete Sale</Button>
        </div>
      </form>
    </Modal>
  );
}