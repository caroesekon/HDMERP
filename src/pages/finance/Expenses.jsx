import { useState, useEffect } from 'react';
import { HiPlus, HiSearch, HiPrinter, HiPencil, HiTrash, HiCheck, HiX } from 'react-icons/hi';
import financeService from '../../services/financeService';
import ExpenseForm from '../../components/finance/ExpenseForm';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { printExpenseList } from '../../utils/printUtils';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });

  useEffect(() => { fetchExpenses(); }, []);
  useEffect(() => { applyFilters(); }, [expenses, filters]);

  const fetchExpenses = async () => {
    setLoading(true);
    try { const res = await financeService.getExpenses(); setExpenses(res.data || []); } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let filtered = [...expenses];
    if (filters.category) filtered = filtered.filter(e => e.category?.toLowerCase().includes(filters.category.toLowerCase()));
    if (filters.status) filtered = filtered.filter(e => e.status === filters.status);
    if (filters.search) filtered = filtered.filter(e => e.description?.toLowerCase().includes(filters.search.toLowerCase()) || e.expenseNumber?.toLowerCase().includes(filters.search.toLowerCase()));
    setFiltered(filtered);
  };

  const handleApprove = async (id) => {
    try { await financeService.approveExpense(id); toast.success('Approved'); fetchExpenses(); } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await financeService.deleteExpense(id); toast.success('Deleted'); fetchExpenses(); } catch { toast.error('Failed'); }
  };

  const handlePrint = () => {
    if (filtered.length === 0) return toast.error('No data');
    printExpenseList(filtered);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="text-2xl font-bold">Expenses</h2><Button onClick={() => { setEditing(null); setModalOpen(true); }}><HiPlus />Add Expense</Button></div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3">
        <Input placeholder="Search" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        <Input placeholder="Category" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} />
        <select className="border rounded-lg px-3 py-2" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="paid">Paid</option>
        </select>
        <Button variant="outline" onClick={() => setFilters({category:'',status:'',search:''})}>Reset</Button>
        <Button variant="outline" onClick={handlePrint}><HiPrinter /></Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr><th>Expense #</th><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(e => (
            <tr key={e._id}>
              <td className="font-mono">{e.expenseNumber}</td><td>{formatDate(e.date)}</td><td>{e.category}</td><td>{e.description}</td>
              <td className="text-red-600">{formatCurrency(e.amount)}</td>
              <td><span className={`px-2 py-1 rounded-full text-xs ${e.status==='approved'?'bg-green-100 text-green-800':e.status==='pending'?'bg-yellow-100 text-yellow-800':'bg-blue-100 text-blue-800'}`}>{e.status}</span></td>
              <td>
                <div className="flex space-x-2">
                  {e.status === 'pending' && <button onClick={() => handleApprove(e._id)} className="text-green-600"><HiCheck /></button>}
                  <button onClick={() => { setEditing(e); setModalOpen(true); }} className="text-gray-600"><HiPencil /></button>
                  <button onClick={() => handleDelete(e._id)} className="text-red-600"><HiTrash /></button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <ExpenseForm isOpen={modalOpen} onClose={() => setModalOpen(false)} expense={editing} onSuccess={() => { setModalOpen(false); fetchExpenses(); }} />
    </div>
  );
}