import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import posService from '../../services/posService';
import toast from 'react-hot-toast';

export default function CategoryForm({ isOpen, onClose, category, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    reset({
      name: category?.name || '',
      description: category?.description || ''
    });
  }, [category, reset, isOpen]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (category) {
        await posService.updateCategory(category._id, data);
        toast.success('Category updated');
      } else {
        await posService.createCategory(data);
        toast.success('Category created');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'Add Category'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name *" {...register('name', { required: true })} error={errors.name} />
        <Input label="Description" {...register('description')} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}