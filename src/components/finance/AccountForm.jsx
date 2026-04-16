import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Account' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' }
];

const CURRENCIES = [
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' }
];

export default function AccountForm({ isOpen, onClose, account, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(account?.type || 'cash');
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: account?.name || '',
      type: account?.type || 'cash',
      balance: account?.balance || 0,
      currency: account?.currency || 'KES',
      description: account?.description || '',
      isActive: account?.isActive !== false,
      bankName: account?.bankDetails?.bankName || '',
      accountNumber: account?.bankDetails?.accountNumber || '',
      branch: account?.bankDetails?.branch || '',
      provider: account?.mobileDetails?.provider || '',
      phoneNumber: account?.mobileDetails?.phoneNumber || ''
    }
  });

  const watchType = watch('type');

  useEffect(() => {
    setSelectedType(watchType);
  }, [watchType]);

  useEffect(() => {
    if (account) {
      reset({
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        description: account.description || '',
        isActive: account.isActive !== false,
        bankName: account.bankDetails?.bankName || '',
        accountNumber: account.bankDetails?.accountNumber || '',
        branch: account.bankDetails?.branch || '',
        provider: account.mobileDetails?.provider || '',
        phoneNumber: account.mobileDetails?.phoneNumber || ''
      });
    } else {
      reset({
        name: '',
        type: 'cash',
        balance: 0,
        currency: 'KES',
        description: '',
        isActive: true,
        bankName: '',
        accountNumber: '',
        branch: '',
        provider: '',
        phoneNumber: ''
      });
    }
  }, [account, reset, isOpen]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Format data based on account type
      const formattedData = {
        name: data.name,
        type: data.type,
        balance: parseFloat(data.balance) || 0,
        currency: data.currency,
        description: data.description,
        isActive: data.isActive
      };

      // Add type-specific details
      if (data.type === 'bank') {
        formattedData.bankDetails = {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          branch: data.branch
        };
      } else if (data.type === 'mobile_money') {
        formattedData.mobileDetails = {
          provider: data.provider,
          phoneNumber: data.phoneNumber
        };
      }

      if (account) {
        await financeService.updateAccount(account._id, formattedData);
        toast.success('Account updated successfully');
      } else {
        await financeService.createAccount(formattedData);
        toast.success('Account created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Account' : 'Add New Account'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Account Name"
            placeholder="e.g., Main Bank Account"
            {...register('name', { required: 'Account name is required' })}
            error={errors.name?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              {...register('type', { required: 'Account type is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              {ACCOUNT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Initial Balance"
            type="number"
            step="0.01"
            {...register('balance')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              {...register('currency')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.value} value={curr.value}>{curr.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bank Account Details (Conditional) */}
        {selectedType === 'bank' && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-800">Bank Account Details</h4>
            <Input
              label="Bank Name"
              placeholder="e.g., KCB Bank"
              {...register('bankName')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Account Number"
                placeholder="1234567890"
                {...register('accountNumber')}
              />
              <Input
                label="Branch"
                placeholder="e.g., Nairobi Branch"
                {...register('branch')}
              />
            </div>
          </div>
        )}

        {/* Mobile Money Details (Conditional) */}
        {selectedType === 'mobile_money' && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-800">Mobile Money Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  {...register('provider')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Provider</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="airtel">Airtel Money</option>
                  <option value="tkash">T-Kash</option>
                </select>
              </div>
              <Input
                label="Phone Number"
                placeholder="0712345678"
                {...register('phoneNumber')}
              />
            </div>
          </div>
        )}

        {/* Description */}
        <Input
          label="Description (Optional)"
          placeholder="Brief description of this account"
          {...register('description')}
        />

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Account is active
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {account ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}