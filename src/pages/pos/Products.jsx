import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiFilter } from 'react-icons/hi';
import posService from '../../services/posService';
import ProductForm from '../../components/pos/ProductForm';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ type: null, data: null });
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, search, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        posService.getProducts(),
        posService.getCategories()
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];
    if (search) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
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
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('');
  };

  if (loading) return <Loader text="Loading products..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Products</h2>
        <Button onClick={() => setModal({ type: 'add', data: null })}>
          <HiPlus className="mr-2" />Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-wrap gap-3 items-end">
        <Input
          label="Search"
          icon={<HiSearch />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Name or SKU..."
          className="flex-1 min-w-[200px]"
        />
        <div className="w-48">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <Button variant="outline" onClick={resetFilters}>
          <HiFilter className="mr-1" />Reset
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">SKU</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No products found</td></tr>
            ) : (
              filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.price)}</td>
                  <td className={`px-4 py-3 text-right ${p.quantity <= (p.lowStockAlert || 5) ? 'text-red-600 font-bold' : ''}`}>
                    {p.quantity}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => setModal({ type: 'edit', data: p })} className="text-blue-600 hover:text-blue-800">
                        <HiPencil />
                      </button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="text-red-600 hover:text-red-800">
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
          Showing {filtered.length} of {products.length} products
        </div>
      </div>

      {modal.type && (
        <ProductForm
          isOpen
          onClose={() => setModal({ type: null, data: null })}
          product={modal.data}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}