import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';

const INCOME_SOURCES = [
  { value: 'sales', label: 'Sales Revenue' },
  { value: 'service', label: 'Service Income' },
  { value: 'interest', label: 'Interest Income' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'commission', label: 'Commission' },
  { value: 'consulting', label: 'Consulting Fees' },
  { value: 'investment', label: 'Investment Returns' },
  { value: 'other', label: 'Other Income' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'cheque', label: 'Cheque' }
];

export default function IncomeForm({ isOpen, onClose, income, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState(income?.source || 'sales');
  const [accounts, setAccounts] = useState([]);
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      source: income?.source || 'sales',
      amount: income?.amount || '',
      description: income?.description || '',
      date: income?.date ? new Date(income.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: income?.paymentMethod || 'cash',
      accountId: income?.accountId || '',
      customerName: income?.customerName || '',
      reference: income?.reference || '',
      notes: income?.notes || ''
    }
  });

  const watchSource = watch('source');

  useEffect(() => {
    setSelectedSource(watchSource);
  }, [watchSource]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await financeService.getAccounts();
        setAccounts(res.data || []);
      } catch (error) {
        console.error('Failed to load accounts');
      }
    };
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (income) {
      reset({
        source: income.source,
        amount: income.amount,
        description: income.description,
        date: new Date(income.date).toISOString().split('T')[0],
        paymentMethod: income.paymentMethod,
        accountId: income.accountId || '',
        customerName: income.customerName || '',
        reference: income.reference || '',
        notes: income.notes || ''
      });
    } else {
      reset({
        source: 'sales',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        accountId: '',
        customerName: '',
        reference: '',
        notes: ''
      });
    }
  }, [income, reset, isOpen]);

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

      if (income) {
        await financeService.updateIncome(income._id, formattedData);
        toast.success('Income record updated successfully');
      } else {
        await financeService.createIncome(formattedData);
        toast.success('Income recorded successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save income record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={income ? 'Edit Income' : 'Record Income'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Source and Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Income Source</label>
            <select
              {...register('source', { required: 'Source is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              {INCOME_SOURCES.map(source => (
                <option key={source.value} value={source.value}>{source.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            {...register('amount', { required: 'Amount is required', min: 0.01 })}
            error={errors.amount?.message}
          />
        </div>

        {/* Description */}
        <Input
          label="Description"
          placeholder="Brief description of this income"
          {...register('description', { required: 'Description is required' })}
          error={errors.description?.message}
        />

        {/* Date and Payment Method */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            {...register('date', { required: 'Date is required' })}
            error={errors.date?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              {...register('paymentMethod')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Account Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deposit To Account</label>
          <select
            {...register('accountId')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="">Select Account (Optional)</option>
            {accounts.filter(a => a.isActive).map(account => (
              <option key={account._id} value={account._id}>
                {account.name} ({account.type}) - {account.currency}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Information */}
        <Input
          label="Customer / Payer Name"
          placeholder="Name of person or business"
          {...register('customerName')}
        />

        {/* Reference Number */}
        <Input
          label="Reference / Invoice Number"
          placeholder="Optional reference number"
          {...register('reference')}
        />

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Any additional notes..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Summary Preview */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Income Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Source:</span>
              <span className="font-medium">{INCOME_SOURCES.find(s => s.value === selectedSource)?.label || selectedSource}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-green-700">
                {watch('amount') ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(watch('amount')) : 'KES 0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {income ? 'Update Income' : 'Record Income'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}