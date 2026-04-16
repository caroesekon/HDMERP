import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { HiSwitchVertical } from 'react-icons/hi';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';

const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income', color: 'text-green-600' },
  { value: 'expense', label: 'Expense', color: 'text-red-600' },
  { value: 'transfer', label: 'Transfer', color: 'text-blue-600' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' }
];

const INCOME_CATEGORIES = [
  { value: 'sales', label: 'Sales' },
  { value: 'service', label: 'Service Income' },
  { value: 'interest', label: 'Interest' },
  { value: 'other', label: 'Other Income' }
];

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'travel', label: 'Travel' },
  { value: 'other', label: 'Other' }
];

export default function TransactionForm({ isOpen, onClose, transaction, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState(transaction?.type || 'expense');
  const [accounts, setAccounts] = useState([]);
  
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      type: transaction?.type || 'expense',
      amount: transaction?.amount ? Math.abs(transaction.amount) : '',
      description: transaction?.description || '',
      category: transaction?.category || '',
      date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: transaction?.paymentMethod || 'cash',
      fromAccount: transaction?.fromAccount || '',
      toAccount: transaction?.toAccount || '',
      reference: transaction?.reference || '',
      notes: transaction?.notes || ''
    }
  });

  const watchType = watch('type');
  const watchAmount = watch('amount');

  useEffect(() => {
    setTransactionType(watchType);
    // Reset category when type changes
    setValue('category', '');
  }, [watchType, setValue]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await financeService.getAccounts();
        setAccounts(res.data?.filter(a => a.isActive) || []);
      } catch (error) {
        console.error('Failed to load accounts');
      }
    };
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: Math.abs(transaction.amount),
        description: transaction.description,
        category: transaction.category,
        date: new Date(transaction.date).toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod,
        fromAccount: transaction.fromAccount || '',
        toAccount: transaction.toAccount || '',
        reference: transaction.reference || '',
        notes: transaction.notes || ''
      });
    } else {
      reset({
        type: 'expense',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        fromAccount: '',
        toAccount: '',
        reference: '',
        notes: ''
      });
    }
  }, [transaction, reset, isOpen]);

  const onSubmit = async (data) => {
    if (parseFloat(data.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (data.type === 'transfer' && !data.fromAccount && !data.toAccount) {
      toast.error('Please select accounts for transfer');
      return;
    }

    setLoading(true);
    try {
      const formattedData = {
        ...data,
        amount: data.type === 'expense' ? -Math.abs(parseFloat(data.amount)) : parseFloat(data.amount)
      };

      if (transaction) {
        await financeService.updateTransaction(transaction._id, formattedData);
        toast.success('Transaction updated successfully');
      } else {
        await financeService.createTransaction(formattedData);
        toast.success('Transaction recorded successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryOptions = () => {
    return transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'New Transaction'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            {TRANSACTION_TYPES.map(type => (
              <label
                key={type.value}
                className={`flex-1 text-center py-2 cursor-pointer transition ${
                  transactionType === type.value
                    ? type.value === 'income' 
                      ? 'bg-green-500 text-white' 
                      : type.value === 'expense'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  value={type.value}
                  {...register('type')}
                  className="hidden"
                />
                {type.label}
              </label>
            ))}
          </div>
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register('amount', { required: 'Amount is required', min: 0.01 })}
          error={errors.amount?.message}
        />

        {/* Description */}
        <Input
          label="Description"
          placeholder="What is this transaction for?"
          {...register('description', { required: 'Description is required' })}
          error={errors.description?.message}
        />

        {/* Category and Date */}
        <div className="grid grid-cols-2 gap-4">
          {transactionType !== 'transfer' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="">Select Category</option>
                {getCategoryOptions().map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div></div>
          )}
          <Input
            label="Date"
            type="date"
            {...register('date', { required: 'Date is required' })}
            error={errors.date?.message}
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            {...register('paymentMethod')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>
        </div>

        {/* Accounts - For Transfer */}
        {transactionType === 'transfer' ? (
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-center text-blue-600">
              <HiSwitchVertical className="h-6 w-6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                <select
                  {...register('fromAccount')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({account.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                <select
                  {...register('toAccount')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Account</option>
                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({account.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {transactionType === 'income' ? 'Deposit To Account' : 'Pay From Account'}
            </label>
            <select
              {...register('fromAccount')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="">Select Account (Optional)</option>
              {accounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.name} ({account.type}) - {account.currency}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reference */}
        <Input
          label="Reference Number"
          placeholder="Invoice, receipt, or reference number"
          {...register('reference')}
        />

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Additional notes..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Summary */}
        <div className={`p-4 rounded-lg ${
          transactionType === 'income' ? 'bg-green-50 border border-green-200' : 
          transactionType === 'expense' ? 'bg-red-50 border border-red-200' : 
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-medium">Transaction Summary:</span>
            <span className={`text-lg font-bold ${
              transactionType === 'income' ? 'text-green-700' : 
              transactionType === 'expense' ? 'text-red-700' : 
              'text-blue-700'
            }`}>
              {watchAmount ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(watchAmount) : 'KES 0.00'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {transaction ? 'Update Transaction' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}