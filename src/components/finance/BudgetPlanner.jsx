import { useState } from 'react';
import { HiPlus } from 'react-icons/hi';
import Button from '../common/Button';
import Input from '../common/Input';
import { formatCurrency } from '../../utils/helpers';

export default function BudgetPlanner() {
  const [budgets, setBudgets] = useState([
    { id: '1', category: 'Marketing', allocated: 50000, spent: 32000 },
    { id: '2', category: 'Operations', allocated: 100000, spent: 45000 },
    { id: '3', category: 'Salaries', allocated: 300000, spent: 280000 }
  ]);

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Budget Overview</h3>
        <Button size="sm" variant="outline"><HiPlus className="mr-1" /> Add Budget</Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Total Budget</p>
          <p className="text-lg font-bold">{formatCurrency(totalAllocated)}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">Total Spent</p>
          <p className="text-lg font-bold text-primary-600">{formatCurrency(totalSpent)}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.allocated) * 100;
          const isOver = percentage > 100;
          return (
            <div key={budget.id} className="border-b pb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{budget.category}</span>
                <span className={isOver ? 'text-red-600' : 'text-gray-600'}>
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}