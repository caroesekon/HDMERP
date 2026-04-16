import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import staffService from '../../services/staffService';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function PayrollForm({ isOpen, onClose, payroll, staffId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [calculatedNet, setCalculatedNet] = useState(0);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      staffId: payroll?.staffId || staffId || '',
      startDate: payroll?.period?.startDate ? new Date(payroll.period.startDate).toISOString().split('T')[0] : '',
      endDate: payroll?.period?.endDate ? new Date(payroll.period.endDate).toISOString().split('T')[0] : '',
      basicSalary: payroll?.basicSalary || '',
      housing: payroll?.allowances?.housing || 0,
      transport: payroll?.allowances?.transport || 0,
      meal: payroll?.allowances?.meal || 0,
      otherAllowance: payroll?.allowances?.other || 0,
      overtimeHours: payroll?.overtimeHours || 0,
      overtimeRate: payroll?.overtimeRate || 1.5,
      bonus: payroll?.bonus || 0,
      tax: payroll?.deductions?.tax || 0,
      pension: payroll?.deductions?.pension || 0,
      health: payroll?.deductions?.health || 0,
      loan: payroll?.deductions?.loan || 0,
      otherDeduction: payroll?.deductions?.other || 0,
      paymentMethod: payroll?.paymentMethod || 'bank',
      notes: payroll?.notes || ''
    }
  });

  const watchBasicSalary = watch('basicSalary');
  const watchHousing = watch('housing');
  const watchTransport = watch('transport');
  const watchMeal = watch('meal');
  const watchOtherAllowance = watch('otherAllowance');
  const watchOvertimeHours = watch('overtimeHours');
  const watchOvertimeRate = watch('overtimeRate');
  const watchBonus = watch('bonus');
  const watchTax = watch('tax');
  const watchPension = watch('pension');
  const watchHealth = watch('health');
  const watchLoan = watch('loan');
  const watchOtherDeduction = watch('otherDeduction');
  const watchStaffId = watch('staffId');

  useEffect(() => {
    // Calculate net salary
    const basic = parseFloat(watchBasicSalary) || 0;
    const housing = parseFloat(watchHousing) || 0;
    const transport = parseFloat(watchTransport) || 0;
    const meal = parseFloat(watchMeal) || 0;
    const otherAllow = parseFloat(watchOtherAllowance) || 0;
    const overtimeHours = parseFloat(watchOvertimeHours) || 0;
    const overtimeRate = parseFloat(watchOvertimeRate) || 1.5;
    const bonus = parseFloat(watchBonus) || 0;
    
    const hourlyRate = basic / 160; // Assuming 160 working hours per month
    const overtimePay = overtimeHours * hourlyRate * overtimeRate;
    
    const grossPay = basic + housing + transport + meal + otherAllow + overtimePay + bonus;
    
    const tax = parseFloat(watchTax) || 0;
    const pension = parseFloat(watchPension) || 0;
    const health = parseFloat(watchHealth) || 0;
    const loan = parseFloat(watchLoan) || 0;
    const otherDed = parseFloat(watchOtherDeduction) || 0;
    
    const totalDeductions = tax + pension + health + loan + otherDed;
    const net = grossPay - totalDeductions;
    
    setCalculatedNet(net);
  }, [watchBasicSalary, watchHousing, watchTransport, watchMeal, watchOtherAllowance, 
      watchOvertimeHours, watchOvertimeRate, watchBonus, watchTax, watchPension, 
      watchHealth, watchLoan, watchOtherDeduction]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await staffService.getAllStaff();
        setStaffList(res.data || []);
      } catch (error) {
        console.error('Failed to load staff list');
      }
    };
    if (isOpen && !staffId) {
      fetchStaff();
    }
  }, [isOpen, staffId]);

  useEffect(() => {
    const staff = staffList.find(s => s._id === watchStaffId);
    if (staff) {
      setSelectedStaff(staff);
      setValue('basicSalary', staff.baseSalary);
    }
  }, [watchStaffId, staffList, setValue]);

  useEffect(() => {
    if (payroll) {
      reset({
        staffId: payroll.staffId,
        startDate: new Date(payroll.period.startDate).toISOString().split('T')[0],
        endDate: new Date(payroll.period.endDate).toISOString().split('T')[0],
        basicSalary: payroll.basicSalary,
        housing: payroll.allowances?.housing || 0,
        transport: payroll.allowances?.transport || 0,
        meal: payroll.allowances?.meal || 0,
        otherAllowance: payroll.allowances?.other || 0,
        overtimeHours: payroll.overtimeHours || 0,
        overtimeRate: payroll.overtimeRate || 1.5,
        bonus: payroll.bonus || 0,
        tax: payroll.deductions?.tax || 0,
        pension: payroll.deductions?.pension || 0,
        health: payroll.deductions?.health || 0,
        loan: payroll.deductions?.loan || 0,
        otherDeduction: payroll.deductions?.other || 0,
        paymentMethod: payroll.paymentMethod || 'bank',
        notes: payroll.notes || ''
      });
    } else {
      reset({
        staffId: staffId || '',
        startDate: '',
        endDate: '',
        basicSalary: '',
        housing: 0,
        transport: 0,
        meal: 0,
        otherAllowance: 0,
        overtimeHours: 0,
        overtimeRate: 1.5,
        bonus: 0,
        tax: 0,
        pension: 0,
        health: 0,
        loan: 0,
        otherDeduction: 0,
        paymentMethod: 'bank',
        notes: ''
      });
    }
  }, [payroll, staffId, reset, isOpen]);

  const onSubmit = async (data) => {
    if (new Date(data.endDate) < new Date(data.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const hourlyRate = data.basicSalary / 160;
      const overtimePay = data.overtimeHours * hourlyRate * data.overtimeRate;
      
      const formattedData = {
        staffId: data.staffId,
        period: {
          startDate: data.startDate,
          endDate: data.endDate
        },
        basicSalary: parseFloat(data.basicSalary),
        allowances: {
          housing: parseFloat(data.housing) || 0,
          transport: parseFloat(data.transport) || 0,
          meal: parseFloat(data.meal) || 0,
          other: parseFloat(data.otherAllowance) || 0
        },
        deductions: {
          tax: parseFloat(data.tax) || 0,
          pension: parseFloat(data.pension) || 0,
          health: parseFloat(data.health) || 0,
          loan: parseFloat(data.loan) || 0,
          other: parseFloat(data.otherDeduction) || 0
        },
        overtimeHours: parseFloat(data.overtimeHours) || 0,
        overtimePay,
        bonus: parseFloat(data.bonus) || 0,
        paymentMethod: data.paymentMethod,
        notes: data.notes
      };

      if (payroll) {
        await staffService.updatePayroll(payroll._id, formattedData);
        toast.success('Payroll updated successfully');
      } else {
        await staffService.generatePayroll(formattedData);
        toast.success('Payroll generated successfully');
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save payroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={payroll ? 'Edit Payroll' : 'Generate Payroll'} size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee Selection */}
        {!staffId && !payroll && (
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

        {/* Period */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Period Start Date"
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
            error={errors.startDate?.message}
          />
          <Input
            label="Period End Date"
            type="date"
            {...register('endDate', { required: 'End date is required' })}
            error={errors.endDate?.message}
          />
        </div>

        {/* Basic Salary */}
        <Input
          label="Basic Salary"
          type="number"
          step="0.01"
          {...register('basicSalary', { required: 'Basic salary is required', min: 0 })}
          error={errors.basicSalary?.message}
          disabled={!!selectedStaff}
        />

        {/* Allowances */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Allowances</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Housing Allowance" type="number" step="0.01" {...register('housing')} />
            <Input label="Transport Allowance" type="number" step="0.01" {...register('transport')} />
            <Input label="Meal Allowance" type="number" step="0.01" {...register('meal')} />
            <Input label="Other Allowance" type="number" step="0.01" {...register('otherAllowance')} />
          </div>
        </div>

        {/* Overtime */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Overtime</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Overtime Hours" type="number" step="0.5" {...register('overtimeHours')} />
            <Input label="Overtime Rate (x)" type="number" step="0.1" {...register('overtimeRate')} />
          </div>
        </div>

        {/* Bonus */}
        <Input label="Bonus" type="number" step="0.01" {...register('bonus')} />

        {/* Deductions */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Deductions</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tax (PAYE)" type="number" step="0.01" {...register('tax')} />
            <Input label="Pension" type="number" step="0.01" {...register('pension')} />
            <Input label="Health Insurance" type="number" step="0.01" {...register('health')} />
            <Input label="Loan Repayment" type="number" step="0.01" {...register('loan')} />
            <Input label="Other Deduction" type="number" step="0.01" {...register('otherDeduction')} />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            {...register('paymentMethod')}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="mobile">Mobile Money</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Additional notes..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-3">Payroll Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Pay:</span>
              <span className="font-medium">{formatCurrency(
                (parseFloat(watchBasicSalary) || 0) +
                (parseFloat(watchHousing) || 0) +
                (parseFloat(watchTransport) || 0) +
                (parseFloat(watchMeal) || 0) +
                (parseFloat(watchOtherAllowance) || 0) +
                (parseFloat(watchOvertimeHours) || 0) * ((parseFloat(watchBasicSalary) || 0) / 160) * (parseFloat(watchOvertimeRate) || 1.5) +
                (parseFloat(watchBonus) || 0)
              )}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Deductions:</span>
              <span className="text-red-600">{formatCurrency(
                (parseFloat(watchTax) || 0) +
                (parseFloat(watchPension) || 0) +
                (parseFloat(watchHealth) || 0) +
                (parseFloat(watchLoan) || 0) +
                (parseFloat(watchOtherDeduction) || 0)
              )}</span>
            </div>
            <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
              <span className="font-medium">Net Pay:</span>
              <span className="text-lg font-bold text-green-700">{formatCurrency(calculatedNet)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {payroll ? 'Update Payroll' : 'Generate Payroll'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}