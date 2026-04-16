import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' }
];

export default function WithdrawalForm({ isOpen, onClose, withdrawal, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      accountId: withdrawal?.accountId || '',
      amount: withdrawal?.amount || '',
      description: withdrawal?.description || '',
      date: withdrawal?.date ? new Date(withdrawal.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: withdrawal?.paymentMethod || 'cash',
      reference: withdrawal?.reference || '',
      notes: withdrawal?.notes || ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (withdrawal) {
      reset({
        accountId: withdrawal.accountId || '',
        amount: withdrawal.amount || '',
        description: withdrawal.description || '',
        date: withdrawal.date ? new Date(withdrawal.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: withdrawal.paymentMethod || 'cash',
        reference: withdrawal.reference || '',
        notes: withdrawal.notes || ''
      });
    }
  }, [withdrawal, reset, isOpen]);

  const fetchAccounts = async () => {
    try {
      const res = await financeService.getAccounts();
      setAccounts(res.data?.filter(a => a.isActive) || []);
    } catch (error) {
      console.error('Failed to load accounts');
    }
  };

  const onSubmit = async (data) => {
    if (parseFloat(data.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount)
      };
      
      await financeService.createWithdrawal(formattedData);
      toast.success('Withdrawal recorded successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Withdrawal" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account <span className="text-red-500">*</span>
          </label>
          <select
            {...register('accountId', { required: 'Account is required' })}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Account</option>
            {accounts.map(a => (
              <option key={a._id} value={a._id}>
                {a.name} ({a.type}) - {formatCurrency(a.balance)}
              </option>
            ))}
          </select>
          {errors.accountId && <p className="text-sm text-red-600 mt-1">{errors.accountId.message}</p>}
        </div>

        <Input
          label="Amount *"
          type="number"
          step="0.01"
          min="0.01"
          {...register('amount', { required: 'Amount is required', min: 0.01 })}
          error={errors.amount?.message}
        />

        <Input
          label="Description *"
          placeholder="Reason for withdrawal"
          {...register('description', { required: 'Description is required' })}
          error={errors.description?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            {...register('date', { required: 'Date is required' })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select {...register('paymentMethod')} className="w-full border rounded-lg px-3 py-2">
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Reference Number (Optional)"
          placeholder="Cheque number, transaction ID, etc."
          {...register('reference')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full border rounded-lg p-2"
            placeholder="Additional notes..."
          />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            <strong>Note:</strong> This will deduct the amount from the selected account balance.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Record Withdrawal</Button>
        </div>
      </form>
    </Modal>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
}