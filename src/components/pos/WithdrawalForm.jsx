import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import posAccountService from '../../services/posAccountService';
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
      posAccountService.getAccounts().then(res => setAccounts(res.data?.filter(a => a.isActive) || []));
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

  const onSubmit = async (data) => {
    if (parseFloat(data.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await posAccountService.createWithdrawal({
        ...data,
        amount: parseFloat(data.amount)
      });
      toast.success('Withdrawal recorded');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Withdrawal" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Account *</label>
          <select {...register('accountId', { required: true })} className="w-full border rounded-lg px-3 py-2">
            <option value="">Select Account</option>
            {accounts.map(a => (
              <option key={a._id} value={a._id}>{a.name} ({a.type}) - {formatCurrency(a.balance)}</option>
            ))}
          </select>
          {errors.accountId && <p className="text-sm text-red-600 mt-1">Account is required</p>}
        </div>

        <Input label="Amount *" type="number" step="0.01" min="0.01" {...register('amount', { required: true, min: 0.01 })} error={errors.amount} />

        <Input label="Description *" {...register('description', { required: true })} error={errors.description} />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" type="date" {...register('date', { required: true })} />
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select {...register('paymentMethod')} className="w-full border rounded-lg px-3 py-2">
              {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <Input label="Reference (Optional)" {...register('reference')} />
        <Input label="Notes (Optional)" {...register('notes')} />

        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800"><strong>Note:</strong> This will deduct the amount from the selected account.</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Record Withdrawal</Button>
        </div>
      </form>
    </Modal>
  );
}