import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import posService from '../../services/posService';
import CustomerForm from '../../components/pos/CustomerForm';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(customers);
    else {
      setFiltered(customers.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
      ));
    }
  }, [customers, search]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await posService.getCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await posService.deleteCustomer(id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <Loader text="Loading customers..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customers</h2>
        <Button onClick={() => setModal({ type: 'add', data: null })}>
          <HiPlus className="mr-2" />Add Customer
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <Input
          placeholder="Search by name, email, or phone..."
          icon={<HiSearch />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-right">Total Spent</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No customers found</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3">{c.email || '-'}</td>
                  <td className="px-4 py-3">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(c.totalSpent || 0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => setModal({ type: 'edit', data: c })} className="text-blue-600">
                        <HiPencil />
                      </button>
                      <button onClick={() => handleDelete(c._id, `${c.firstName} ${c.lastName}`)} className="text-red-600">
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal.type && (
        <CustomerForm
          isOpen
          onClose={() => setModal({ type: null, data: null })}
          customer={modal.data}
          onSuccess={fetchCustomers}
        />
      )}
    </div>
  );
}