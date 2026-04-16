import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import posService from '../../services/posService';
import toast from 'react-hot-toast';

export default function CustomerForm({ isOpen, onClose, customer, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    reset({
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || ''
    });
  }, [customer, reset, isOpen]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (customer) {
        await posService.updateCustomer(customer._id, data);
        toast.success('Customer updated');
      } else {
        await posService.createCustomer(data);
        toast.success('Customer created');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Edit Customer' : 'Add Customer'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name *" {...register('firstName', { required: true })} error={errors.firstName} />
          <Input label="Last Name *" {...register('lastName', { required: true })} error={errors.lastName} />
        </div>
        <Input label="Email" type="email" {...register('email')} />
        <Input label="Phone" {...register('phone')} />
        <Input label="Address" {...register('address')} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}