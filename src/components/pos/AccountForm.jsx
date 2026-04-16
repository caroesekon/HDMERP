import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import posAccountService from '../../services/posAccountService';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank Account' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'other', label: 'Other' }
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
      accountName: account?.bankDetails?.accountName || '',
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
        accountName: account.bankDetails?.accountName || '',
        provider: account.mobileDetails?.provider || '',
        phoneNumber: account.mobileDetails?.phoneNumber || ''
      });
    }
  }, [account, reset, isOpen]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formattedData = {
        name: data.name,
        type: data.type,
        balance: parseFloat(data.balance) || 0,
        currency: data.currency,
        description: data.description,
        isActive: data.isActive
      };

      if (data.type === 'bank') {
        formattedData.bankDetails = {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          branch: data.branch,
          accountName: data.accountName
        };
      } else if (data.type === 'mobile_money') {
        formattedData.mobileDetails = {
          provider: data.provider,
          phoneNumber: data.phoneNumber
        };
      }

      if (account) {
        await posAccountService.updateAccount(account._id, formattedData);
        toast.success('Account updated');
      } else {
        await posAccountService.createAccount(formattedData);
        toast.success('Account created');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Account' : 'Add Account'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Account Name *" {...register('name', { required: true })} error={errors.name} />
          <div>
            <label className="block text-sm font-medium mb-1">Account Type *</label>
            <select {...register('type', { required: true })} className="w-full border rounded-lg px-3 py-2">
              {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Initial Balance" type="number" step="0.01" {...register('balance')} />
          <Input label="Currency" {...register('currency')} />
        </div>

        {selectedType === 'bank' && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium">Bank Details</h4>
            <Input label="Bank Name" {...register('bankName')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Account Number" {...register('accountNumber')} />
              <Input label="Branch" {...register('branch')} />
            </div>
            <Input label="Account Name" {...register('accountName')} />
          </div>
        )}

        {selectedType === 'mobile_money' && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium">Mobile Money Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <select {...register('provider')} className="w-full border rounded-lg px-3 py-2">
                <option value="">Select Provider</option>
                <option value="mpesa">M-Pesa</option>
                <option value="airtel">Airtel Money</option>
                <option value="tkash">T-Kash</option>
              </select>
              <Input label="Phone Number" {...register('phoneNumber')} />
            </div>
          </div>
        )}

        <Input label="Description" {...register('description')} />

        <label className="flex items-center">
          <input type="checkbox" {...register('isActive')} className="rounded" />
          <span className="ml-2">Active</span>
        </label>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}