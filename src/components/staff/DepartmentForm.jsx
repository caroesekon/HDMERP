import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import staffService from '../../services/staffService';
import toast from 'react-hot-toast';

export default function DepartmentForm({ isOpen, onClose, department, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: department?.name || '',
      description: department?.description || '',
      manager: department?.manager || '',
      isActive: department?.isActive !== false
    }
  });

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await staffService.getAllStaff({ role: 'manager' });
        setManagers(res.data || []);
      } catch (error) {
        console.error('Failed to load managers');
      }
    };
    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description || '',
        manager: department.manager || '',
        isActive: department.isActive !== false
      });
    } else {
      reset({ name: '', description: '', manager: '', isActive: true });
    }
  }, [department, reset, isOpen]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (department) {
        await staffService.updateDepartment(department._id, data);
        toast.success('Department updated');
      } else {
        await staffService.createDepartment(data);
        toast.success('Department created');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to save department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={department ? 'Edit Department' : 'Add Department'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Department Name" {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
        <Input label="Description" {...register('description')} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department Manager</label>
          <select {...register('manager')} className="w-full px-4 py-2.5 border rounded-lg">
            <option value="">Select Manager</option>
            {managers.map(m => <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>)}
          </select>
        </div>
        <div className="flex items-center">
          <input type="checkbox" {...register('isActive')} className="rounded" />
          <label className="ml-2 text-sm">Active</label>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}