import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import staffService from '../../services/staffService';
import { LEAVE_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function LeaveForm({ isOpen, onClose, leave, onSuccess, staffId: propStaffId }) {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [daysCount, setDaysCount] = useState(0);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      staffId: leave?.staffId || propStaffId || '',
      leaveType: leave?.leaveType || 'annual',
      startDate: leave?.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '',
      endDate: leave?.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '',
      reason: leave?.reason || ''
    }
  });

  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');

  useEffect(() => {
    if (watchStartDate && watchEndDate) {
      const start = new Date(watchStartDate);
      const end = new Date(watchEndDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDaysCount(diffDays);
      } else {
        setDaysCount(0);
      }
    } else {
      setDaysCount(0);
    }
  }, [watchStartDate, watchEndDate]);

  useEffect(() => {
    // Fetch staff list for admin/manager to select employee
    const fetchStaff = async () => {
      try {
        const res = await staffService.getAllStaff();
        setStaffList(res.data || []);
      } catch (error) {
        console.error('Failed to load staff list');
      }
    };
    if (isOpen && !propStaffId) {
      fetchStaff();
    }
  }, [isOpen, propStaffId]);

  useEffect(() => {
    if (leave) {
      reset({
        staffId: leave.staffId,
        leaveType: leave.leaveType,
        startDate: new Date(leave.startDate).toISOString().split('T')[0],
        endDate: new Date(leave.endDate).toISOString().split('T')[0],
        reason: leave.reason
      });
    } else {
      reset({
        staffId: propStaffId || '',
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
      });
    }
  }, [leave, propStaffId, reset, isOpen]);

  const onSubmit = async (data) => {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      if (leave) {
        await staffService.updateLeave(leave._id, data);
        toast.success('Leave request updated');
      } else {
        await staffService.applyLeave(data);
        toast.success('Leave application submitted');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={leave ? 'Edit Leave Request' : 'Apply for Leave'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Staff Selection - only show if not pre-selected and not editing */}
        {!propStaffId && !leave && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              {...register('staffId', { required: 'Please select an employee' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">Select Employee</option>
              {staffList.map(staff => (
                <option key={staff._id} value={staff._id}>
                  {staff.firstName} {staff.lastName} ({staff.employeeId})
                </option>
              ))}
            </select>
            {errors.staffId && <p className="mt-1 text-sm text-red-600">{errors.staffId.message}</p>}
          </div>
        )}

        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
          <select
            {...register('leaveType', { required: 'Leave type is required' })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            {LEAVE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Date Range */}
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

        {/* Days Count Display */}
        {daysCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Total Days:</span> {daysCount} day{daysCount !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea
            {...register('reason')}
            rows={3}
            placeholder="Please provide a reason for your leave request..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Leave Balance Info (optional) */}
        {propStaffId && !leave && (
          <LeaveBalance staffId={propStaffId} />
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {leave ? 'Update Request' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Helper component to show leave balance
function LeaveBalance({ staffId }) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await staffService.getLeaveBalance(staffId);
        setBalance(res.data);
      } catch (error) {
        console.error('Failed to load leave balance');
      }
    };
    fetchBalance();
  }, [staffId]);

  if (!balance) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <p className="text-sm font-medium text-blue-800">Leave Balance</p>
      <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
        <div>
          <span className="text-gray-600">Entitled:</span>
          <span className="font-medium ml-1">{balance.entitled || 0} days</span>
        </div>
        <div>
          <span className="text-gray-600">Taken:</span>
          <span className="font-medium ml-1">{balance.taken || 0} days</span>
        </div>
        <div>
          <span className="text-gray-600">Remaining:</span>
          <span className="font-medium ml-1 text-green-700">{balance.remaining || 0} days</span>
        </div>
      </div>
    </div>
  );
}