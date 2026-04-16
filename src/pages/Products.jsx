import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiPrinter, HiFilter } from 'react-icons/hi';
import posService from '../../services/posService';
import ProductForm from '../../components/pos/ProductForm';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { printProductList } from '../../utils/printUtils';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState({ type: null, data: null });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, search, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await posService.getProducts();
      setProducts(res.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await posService.getCategories();
      setCategories(res.data || []);
    } catch {}
  };

  const applyFilters = () => {
    let filtered = [...products];
    if (search) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category?._id === categoryFilter);
    }
    setFiltered(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await posService.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handlePrint = () => {
    if (filtered.length === 0) return toast.error('No data to print');
    printProductList(filtered);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={() => setModal({ type: 'add', data: null })}><HiPlus className="mr-2" />Add Product</Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-3 items-end">
        <Input label="Search" icon={<HiSearch />} value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, SKU, Barcode..." />
        <select className="border rounded-lg px-3 py-2" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <Button variant="outline" onClick={() => { setSearch(''); setCategoryFilter(''); }}>Reset</Button>
        <Button variant="outline" onClick={handlePrint}><HiPrinter className="mr-1" />Print</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th>SKU</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(p => (
            <tr key={p._id}><td className="font-mono">{p.sku}</td><td className="font-medium">{p.name}</td><td>{p.category?.name || '-'}</td>
              <td>{formatCurrency(p.price)}</td><td className={p.quantity <= p.lowStockAlert ? 'text-red-600 font-bold' : ''}>{p.quantity}</td>
              <td><div className="flex space-x-2"><button onClick={() => setModal({type:'edit',data:p})} className="text-blue-600"><HiPencil /></button>
                <button onClick={() => handleDelete(p._id, p.name)} className="text-red-600"><HiTrash /></button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {modal.type && <ProductForm isOpen onClose={() => setModal({type:null})} product={modal.data} onSuccess={fetchProducts} />}
    </div>
  );
}