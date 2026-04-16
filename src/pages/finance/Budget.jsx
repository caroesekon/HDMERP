import { useState, useEffect } from 'react';
import { HiPlus, HiPrinter, HiPencil, HiTrash } from 'react-icons/hi';
import financeService from '../../services/financeService';
import BudgetForm from '../../components/finance/BudgetForm';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { printBudgetReport } from '../../utils/printUtils';

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await financeService.getBudgets();
      setBudgets(res.data || []);
    } catch (error) {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await financeService.deleteBudget(id);
      toast.success('Budget deleted');
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handlePrint = (budget) => {
    printBudgetReport(budget);
  };

  if (loading) return <Loader text="Loading budgets..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Budget Planning</h2>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}>
          <HiPlus className="mr-2 h-4 w-4" /> New Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">No budgets found. Create your first budget.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {budgets.map((b) => {
            const spent = b.categories?.reduce((sum, c) => sum + (c.spent || 0), 0) || 0;
            const allocated = b.totalAllocated || 0;
            const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
            
            return (
              <div key={b._id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{b.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(b.period?.startDate)} - {formatDate(b.period?.endDate)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePrint(b)}
                      className="p-1.5 text-gray-500 hover:text-purple-600"
                      title="Print"
                    >
                      <HiPrinter className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setEditing(b); setModalOpen(true); }}
                      className="p-1.5 text-gray-500 hover:text-blue-600"
                      title="Edit"
                    >
                      <HiPencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1.5 text-gray-500 hover:text-red-600"
                      title="Delete"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Spent: {formatCurrency(spent)}</span>
                    <span className="text-gray-600">Budget: {formatCurrency(allocated)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% used</p>
                </div>

                {b.categories && b.categories.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Categories:</p>
                    {b.categories.map((c, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{c.category}</span>
                        <span className="font-medium">
                          {formatCurrency(c.spent || 0)} / {formatCurrency(c.allocated || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BudgetForm
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        budget={editing}
        onSuccess={() => {
          setModalOpen(false);
          fetchBudgets();
        }}
      />
    </div>
  );
}