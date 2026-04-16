import { useState } from 'react';
import { HiCash } from 'react-icons/hi';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import staffService from '../../services/staffService';
import { formatCurrency } from '../../utils/helpers';

export default function PayrollProcessor({ staffId, staffName, baseSalary, onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    bonus: '0',
    overtime: '0'
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await staffService.generatePayroll({
        staffId,
        ...formData,
        bonus: parseFloat(formData.bonus),
        overtimePay: parseFloat(formData.overtime)
      });
      onSuccess?.();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to generate payroll', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <HiCash className="mr-1" /> Generate Payroll
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Generate Payroll - ${staffName}`}>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Base Salary: {formatCurrency(baseSalary)}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} required />
            <Input label="End Date" type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bonus" type="number" value={formData.bonus} onChange={e => setFormData({...formData, bonus: e.target.value})} />
            <Input label="Overtime Pay" type="number" value={formData.overtime} onChange={e => setFormData({...formData, overtime: e.target.value})} />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Generate</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}