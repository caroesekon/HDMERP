import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { HiPlus, HiTrash } from 'react-icons/hi';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import financeService from '../../services/financeService';
import toast from 'react-hot-toast';

export default function BudgetForm({ isOpen, onClose, budget, onSuccess }) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: budget?.name || '',
      startDate: budget?.period?.startDate ? new Date(budget.period.startDate).toISOString().split('T')[0] : '',
      endDate: budget?.period?.endDate ? new Date(budget.period.endDate).toISOString().split('T')[0] : '',
      categories: budget?.categories || [{ category: '', allocated: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'categories'
  });

  const watchCategories = watch('categories');
  const totalAllocated = watchCategories?.reduce((sum, cat) => sum + (parseFloat(cat.allocated) || 0), 0) || 0;

  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name,
        startDate: budget.period?.startDate ? new Date(budget.period.startDate).toISOString().split('T')[0] : '',
        endDate: budget.period?.endDate ? new Date(budget.period.endDate).toISOString().split('T')[0] : '',
        categories: budget.categories?.length ? budget.categories : [{ category: '', allocated: 0 }]
      });
    } else {
      reset({
        name: '',
        startDate: '',
        endDate: '',
        categories: [{ category: '', allocated: 0 }]
      });
    }
  }, [budget, reset, isOpen]);

  const onSubmit = async (data) => {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (data.categories.length === 0) {
      toast.error('Add at least one budget category');
      return;
    }

    const formattedData = {
      name: data.name,
      period: {
        startDate: data.startDate,
        endDate: data.endDate
      },
      categories: data.categories.map(cat => ({
        category: cat.category,
        allocated: parseFloat(cat.allocated) || 0,
        spent: cat.spent || 0
      })),
      totalAllocated: data.categories.reduce((sum, cat) => sum + (parseFloat(cat.allocated) || 0), 0)
    };

    setLoading(true);
    try {
      if (budget) {
        await financeService.updateBudget(budget._id, formattedData);
        toast.success('Budget updated successfully');
      } else {
        await financeService.createBudget(formattedData);
        toast.success('Budget created successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={budget ? 'Edit Budget' : 'Create New Budget'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Budget Name */}
        <Input
          label="Budget Name"
          placeholder="e.g., Q2 2026 Operating Budget"
          {...register('name', { required: 'Budget name is required' })}
          error={errors.name?.message}
        />

        {/* Period */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
            error={errors.startDate?.message}
          />
          <Input
            label="End Date"
            type="date"
            {...register('endDate', { required: 'End date is required' })}
            error={errors.endDate?.message}
          />
        </div>

        {/* Categories */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Budget Categories</label>
            <button
              type="button"
              onClick={() => append({ category: '', allocated: 0 })}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center"
            >
              <HiPlus className="mr-1" /> Add Category
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto p-1">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Category name"
                    {...register(`categories.${index}.category`, { required: 'Required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Amount"
                    {...register(`categories.${index}.allocated`, { required: 'Required', min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <HiTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 p-3 bg-purple-50 rounded-lg flex justify-between items-center">
            <span className="font-medium text-gray-700">Total Budget:</span>
            <span className="text-lg font-bold text-purple-700">
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(totalAllocated)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}