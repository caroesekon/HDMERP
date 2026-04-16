import { useState, useEffect } from 'react';
import { HiPlus, HiSearch, HiPrinter, HiPencil, HiTrash } from 'react-icons/hi';
import financeService from '../../services/financeService';
import IncomeForm from '../../components/finance/IncomeForm';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { printIncomeList } from '../../utils/printUtils';

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ source: '', search: '' });

  useEffect(() => { fetchIncomes(); }, []);
  useEffect(() => { applyFilters(); }, [incomes, filters]);

  const fetchIncomes = async () => {
    setLoading(true);
    try { const res = await financeService.getIncomes(); setIncomes(res.data || []); } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let filtered = [...incomes];
    if (filters.source) filtered = filtered.filter(i => i.source?.toLowerCase().includes(filters.source.toLowerCase()));
    if (filters.search) filtered = filtered.filter(i => i.description?.toLowerCase().includes(filters.search.toLowerCase()));
    setFiltered(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await financeService.deleteIncome(id); toast.success('Deleted'); fetchIncomes(); } catch { toast.error('Failed'); }
  };

  const handlePrint = () => {
    if (filtered.length === 0) return toast.error('No data');
    printIncomeList(filtered);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between"><h2 className="text-2xl font-bold">Income</h2><Button onClick={() => { setEditing(null); setModalOpen(true); }}><HiPlus />Add Income</Button></div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex gap-3">
        <Input placeholder="Search" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        <Input placeholder="Source" value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})} />
        <Button variant="outline" onClick={() => setFilters({source:'',search:''})}>Reset</Button>
        <Button variant="outline" onClick={handlePrint}><HiPrinter /></Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr><th>Income #</th><th>Date</th><th>Source</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(i => (
            <tr key={i._id}>
              <td className="font-mono">{i.incomeNumber}</td><td>{formatDate(i.date)}</td><td>{i.source}</td><td>{i.description}</td>
              <td className="text-green-600">{formatCurrency(i.amount)}</td>
              <td><div className="flex space-x-2"><button onClick={() => { setEditing(i); setModalOpen(true); }}><HiPencil /></button><button onClick={() => handleDelete(i._id)} className="text-red-600"><HiTrash /></button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <IncomeForm isOpen={modalOpen} onClose={() => setModalOpen(false)} income={editing} onSuccess={() => { setModalOpen(false); fetchIncomes(); }} />
    </div>
  );
}