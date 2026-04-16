import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries & Wages' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'travel', label: 'Travel & Entertainment' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'professional_fees', label: 'Professional Fees' },
  { value: 'maintenance', label: 'Repairs & Maintenance' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'miscellaneous', label: 'Miscellaneous' }
];

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'mobile', label: 'Mobile Money' },
  { value: 'cheque', label: 'Cheque' }
];

const EXPENSE_STATUS = [
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' }
];

export default function ExpenseForm({ isOpen, onClose, expense, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      category: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      accountId: '',
      vendor: '',
      invoiceNumber: '',
      status: 'pending',
      notes: ''
    }
  });

  const watchAmount = watch('amount');
  const watchCategory = watch('category');

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
    if (expense) {
      reset({
        category: expense.category || '',
        amount: expense.amount || '',
        description: expense.description || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: expense.paymentMethod || 'cash',
        accountId: expense.accountId || '',
        vendor: expense.vendor || '',
        invoiceNumber: expense.invoiceNumber || '',
        status: expense.status || 'pending',
        notes: expense.notes || ''
      });
      setReceiptPreview(expense.receipt || null);
    } else {
      reset({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        accountId: '',
        vendor: '',
        invoiceNumber: '',
        status: 'pending',
        notes: ''
      });
      setReceiptPreview(null);
      setReceiptFile(null);
    }
  }, [expense, reset, isOpen]);

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    // Validate required fields
    if (!data.category) {
      toast.error('Please select a category');
      return;
    }
    if (!data.amount || parseFloat(data.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    if (!data.description || data.description.trim() === '') {
      toast.error('Description is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('amount', parseFloat(data.amount));
      formData.append('description', data.description.trim());
      formData.append('date', data.date);
      formData.append('paymentMethod', data.paymentMethod);
      if (data.accountId) formData.append('accountId', data.accountId);
      if (data.vendor) formData.append('vendor', data.vendor);
      if (data.invoiceNumber) formData.append('invoiceNumber', data.invoiceNumber);
      formData.append('status', data.status);
      if (data.notes) formData.append('notes', data.notes);
      if (receiptFile) formData.append('receipt', receiptFile);

      if (expense) {
        await financeService.updateExpense(expense._id, formData);
        toast.success('Expense updated successfully');
      } else {
        await financeService.createExpense(formData);
        toast.success('Expense recorded successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Expense save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Edit Expense' : 'Record Expense'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Category and Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="">Select Category</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...register('amount', { required: 'Amount is required', min: 0.01 })}
              error={errors.amount?.message}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="What was this expense for?"
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message}
          />
        </div>

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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Account and Vendor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pay From Account</label>
            <select
              {...register('accountId')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="">Select Account (Optional)</option>
              {accounts.filter(a => a.isActive).map(account => (
                <option key={account._id} value={account._id}>
                  {account.name} ({account.type})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Vendor / Payee"
            placeholder="Name of vendor or recipient"
            {...register('vendor')}
          />
        </div>

        {/* Invoice Number and Status */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Invoice / Reference Number"
            placeholder="Optional"
            {...register('invoiceNumber')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              {EXPENSE_STATUS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleReceiptChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
            {receiptPreview && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Receipt Preview:</p>
                {receiptPreview.startsWith('data:image') ? (
                  <img src={receiptPreview} alt="Receipt" className="max-h-32 rounded-lg" />
                ) : (
                  <p className="text-sm text-gray-600">File uploaded</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Any additional notes..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Summary Preview */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Expense Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">
                {EXPENSE_CATEGORIES.find(c => c.value === watchCategory)?.label || 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-red-700">
                {watchAmount ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(watchAmount) : 'KES 0.00'}
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
            {expense ? 'Update Expense' : 'Record Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}