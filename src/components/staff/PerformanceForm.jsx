import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import staffService from '../../services/staffService';
import toast from 'react-hot-toast';
import { HiStar } from 'react-icons/hi';

const CATEGORIES = [
  'Job Knowledge',
  'Work Quality',
  'Productivity',
  'Communication',
  'Teamwork',
  'Initiative',
  'Attendance',
  'Leadership'
];

export default function PerformanceForm({ isOpen, onClose, review, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [categories, setCategories] = useState(
    CATEGORIES.map(name => ({ name, rating: 0 }))
  );
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      staffId: review?.staffId || '',
      title: review?.title || '',
      reviewDate: review?.reviewDate ? new Date(review.reviewDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      periodStart: review?.periodStart ? new Date(review.periodStart).toISOString().split('T')[0] : '',
      periodEnd: review?.periodEnd ? new Date(review.periodEnd).toISOString().split('T')[0] : '',
      rating: review?.rating || 0,
      strengths: review?.strengths || '',
      improvements: review?.improvements || '',
      goals: review?.goals || '',
      comments: review?.comments || '',
      status: review?.status || 'pending',
      nextReviewDate: review?.nextReviewDate ? new Date(review.nextReviewDate).toISOString().split('T')[0] : ''
    }
  });

  useEffect(() => {
    fetchStaffList();
  }, []);

  useEffect(() => {
    if (review?.categories) {
      setCategories(review.categories);
    }
  }, [review]);

  const fetchStaffList = async () => {
    try {
      const res = await staffService.getAllStaff();
      setStaffList(res.data || []);
    } catch (error) {
      console.error('Failed to load staff');
    }
  };

  const updateCategoryRating = (index, rating) => {
    const newCategories = [...categories];
    newCategories[index].rating = rating;
    setCategories(newCategories);
    
    // Calculate overall rating
    const avg = newCategories.reduce((sum, c) => sum + c.rating, 0) / newCategories.length;
    setValue('rating', Math.round(avg * 10) / 10);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = {
        ...data,
        categories,
        rating: parseFloat(data.rating) || 0
      };
      
      if (review) {
        await staffService.updatePerformanceReview(review._id, formData);
        toast.success('Review updated');
      } else {
        await staffService.createPerformanceReview(formData);
        toast.success('Review created');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to save review');
    } finally {
      setLoading(false);
    }
  };

  const watchRating = watch('rating');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={review ? 'Edit Review' : 'New Performance Review'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employee *</label>
            <select
              {...register('staffId', { required: 'Employee is required' })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Employee</option>
              {staffList.map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.employeeId})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Review Title *"
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Review Date *" type="date" {...register('reviewDate', { required: true })} />
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select {...register('status')} className="w-full border rounded-lg px-3 py-2">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Review Period Start" type="date" {...register('periodStart')} />
          <Input label="Review Period End" type="date" {...register('periodEnd')} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category Ratings</label>
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm">{cat.name}</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateCategoryRating(idx, star)}
                      className="focus:outline-none"
                    >
                      <HiStar
                        className={`h-5 w-5 ${
                          star <= cat.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Overall Rating</label>
          <div className="flex items-center space-x-2">
            <Input type="number" step="0.1" min="0" max="5" {...register('rating')} className="w-24" />
            <span className="text-sm text-gray-500">/ 5.0</span>
            {watchRating > 0 && (
              <div className="flex ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HiStar
                    key={star}
                    className={`h-5 w-5 ${
                      star <= watchRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Strengths</label>
          <textarea
            {...register('strengths')}
            rows={2}
            className="w-full border rounded-lg p-2"
            placeholder="What are the employee's key strengths?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Areas for Improvement</label>
          <textarea
            {...register('improvements')}
            rows={2}
            className="w-full border rounded-lg p-2"
            placeholder="What areas need development?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Goals & Objectives</label>
          <textarea
            {...register('goals')}
            rows={2}
            className="w-full border rounded-lg p-2"
            placeholder="Set goals for the next period"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Additional Comments</label>
          <textarea
            {...register('comments')}
            rows={2}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <Input label="Next Review Date" type="date" {...register('nextReviewDate')} />

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{review ? 'Update' : 'Create'} Review</Button>
        </div>
      </form>
    </Modal>
  );
}