import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import posService from '../../services/posService';
import toast from 'react-hot-toast';

export default function InventoryAdjustForm({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const watchType = watch('type', 'in');

  useEffect(() => {
    if (isOpen) {
      posService.getProducts().then(r => setProducts(r.data || []));
    }
  }, [isOpen]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await posService.adjustInventory(data.productId, {
        quantity: parseInt(data.quantity),
        type: data.type,
        reason: data.reason
      });
      toast.success('Inventory adjusted');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Adjustment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Inventory" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product *</label>
          <select {...register('productId', { required: true })} className="w-full border rounded-lg px-3 py-2">
            <option value="">Select Product</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.quantity})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Adjustment Type *</label>
          <select {...register('type', { required: true })} className="w-full border rounded-lg px-3 py-2">
            <option value="in">Stock In (+)</option>
            <option value="out">Stock Out (-)</option>
            <option value="adjustment">Set Exact</option>
          </select>
        </div>
        <Input 
          label={watchType === 'adjustment' ? 'New Quantity *' : 'Quantity *'} 
          type="number" 
          {...register('quantity', { required: true, min: 0 })} 
        />
        <Input label="Reason" {...register('reason')} />
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}