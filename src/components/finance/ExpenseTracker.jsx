import { useState, useEffect } from 'react';
import { HiPlus } from 'react-icons/hi';
import financeService from '../../services/financeService';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Loader from '../common/Loader';
import { formatCurrency } from '../../utils/helpers';

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '', description: '' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await financeService.getExpenses();
      setExpenses(res.data || []);
    } catch (error) {
      console.error('Failed to load expenses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await financeService.createExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setIsModalOpen(false);
      setFormData({ category: '', amount: '', description: '' });
      fetchExpenses();
    } catch (error) {
      console.error('Failed to create expense', error);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Expenses</h3>
        <Button onClick={() => setIsModalOpen(true)} size="sm"><HiPlus className="mr-1" /> Add</Button>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">Total this month</p>
        <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
      </div>
      
      {loading ? <Loader /> : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {expenses.map((exp) => (
            <div key={exp._id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
              <div>
                <p className="font-medium">{exp.description}</p>
                <p className="text-xs text-gray-500">{exp.category}</p>
              </div>
              <p className="font-semibold text-red-600">{formatCurrency(exp.amount)}</p>
            </div>
          ))}
        </div>
      )}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Expense">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
          <Input label="Amount" type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
          <Input label="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}