import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import posService from '../../services/posService';
import toast from 'react-hot-toast';

export default function ProductForm({ isOpen, onClose, product, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    posService.getCategories().then(r => setCategories(r.data || []));
  }, []);

  useEffect(() => {
    if (product) {
      reset({
        sku: product.sku || '',
        name: product.name || '',
        category: product.category?._id || '',
        price: product.price || '',
        cost: product.cost || '',
        quantity: product.quantity || 0,
        lowStockAlert: product.lowStockAlert || 5,
        description: product.description || ''
      });
    } else {
      reset({
        sku: '',
        name: '',
        category: '',
        price: '',
        cost: '',
        quantity: 0,
        lowStockAlert: 5,
        description: ''
      });
    }
  }, [product, reset, isOpen]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        quantity: parseInt(data.quantity),
        lowStockAlert: parseInt(data.lowStockAlert)
      };
      if (product) {
        await posService.updateProduct(product._id, payload);
        toast.success('Product updated');
      } else {
        await posService.createProduct(payload);
        toast.success('Product created');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU *" {...register('sku', { required: true })} error={errors.sku} />
          <Input label="Name *" {...register('name', { required: true })} error={errors.name} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select {...register('category')} className="w-full border rounded-lg px-3 py-2">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price *" type="number" step="0.01" {...register('price', { required: true, min: 0 })} />
          <Input label="Cost" type="number" step="0.01" {...register('cost', { min: 0 })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Initial Stock" type="number" {...register('quantity', { min: 0 })} />
          <Input label="Low Stock Alert" type="number" {...register('lowStockAlert', { min: 0 })} />
        </div>
        <Input label="Description" {...register('description')} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}