import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import staffService from '../../services/staffService';
import toast from 'react-hot-toast';

export default function EmployeeForm({ isOpen, onClose, employee, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      employeeId: '',
      department: '',
      position: '',
      employmentType: 'full_time',
      baseSalary: '',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      bankName: '',
      accountNumber: '',
      accountName: '',
      emergencyName: '',
      emergencyRelationship: '',
      emergencyPhone: ''
    }
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (employee) {
      reset({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        employeeId: employee.employeeId || '',
        department: employee.department?._id || employee.department || '',
        position: employee.position || '',
        employmentType: employee.employmentType || 'full_time',
        baseSalary: employee.baseSalary || '',
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isActive: employee.isActive !== false,
        bankName: employee.bankAccount?.bankName || '',
        accountNumber: employee.bankAccount?.accountNumber || '',
        accountName: employee.bankAccount?.accountName || '',
        emergencyName: employee.emergencyContact?.name || '',
        emergencyRelationship: employee.emergencyContact?.relationship || '',
        emergencyPhone: employee.emergencyContact?.phone || ''
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        employeeId: '',
        department: '',
        position: '',
        employmentType: 'full_time',
        baseSalary: '',
        joinDate: new Date().toISOString().split('T')[0],
        isActive: true,
        bankName: '',
        accountNumber: '',
        accountName: '',
        emergencyName: '',
        emergencyRelationship: '',
        emergencyPhone: ''
      });
    }
  }, [employee, reset, isOpen]);

  const fetchDepartments = async () => {
    try {
      const res = await staffService.getDepartments();
      setDepartments(res.data || []);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const submitHandler = async (data) => {
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = {
        ...data,
        baseSalary: parseFloat(data.baseSalary) || 0,
        bankAccount: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountName: data.accountName
        },
        emergencyContact: {
          name: data.emergencyName,
          relationship: data.emergencyRelationship,
          phone: data.emergencyPhone
        }
      };

      // Remove individual fields
      delete formData.bankName;
      delete formData.accountNumber;
      delete formData.accountName;
      delete formData.emergencyName;
      delete formData.emergencyRelationship;
      delete formData.emergencyPhone;

      if (employee) {
        await staffService.updateStaff(employee._id, formData);
        toast.success('Employee updated successfully');
      } else {
        await staffService.createStaff(formData);
        toast.success('Employee created successfully');
      }
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee ? 'Edit Employee' : 'Add New Employee'} size="xl">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name *"
              {...register('firstName', { required: 'First name is required' })}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name *"
              {...register('lastName', { required: 'Last name is required' })}
              error={errors.lastName?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input
              label="Email *"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
              })}
              error={errors.email?.message}
            />
            <Input
              label="Phone"
              {...register('phone')}
            />
          </div>
        </div>

        {/* Employment Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Employment Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              {...register('employeeId')}
              placeholder="Auto-generated if empty"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                {...register('department')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input
              label="Position"
              {...register('position')}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                {...register('employmentType')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input
              label="Base Salary *"
              type="number"
              step="0.01"
              {...register('baseSalary', { required: 'Base salary is required', min: 0 })}
              error={errors.baseSalary?.message}
            />
            <Input
              label="Join Date *"
              type="date"
              {...register('joinDate', { required: 'Join date is required' })}
              error={errors.joinDate?.message}
            />
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active Employee</span>
            </label>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Bank Details (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bank Name" {...register('bankName')} />
            <Input label="Account Number" {...register('accountNumber')} />
          </div>
          <div className="mt-4">
            <Input label="Account Name" {...register('accountName')} />
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Emergency Contact (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Name" {...register('emergencyName')} />
            <Input label="Relationship" {...register('emergencyRelationship')} />
          </div>
          <div className="mt-4">
            <Input label="Contact Phone" {...register('emergencyPhone')} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {employee ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}