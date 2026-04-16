import { useState, useEffect } from 'react';
import { HiSearch } from 'react-icons/hi';
import posService from '../../services/posService';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../common/Loader';
import Input from '../common/Input';

export default function ProductGrid({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProducts(); }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await posService.getProducts({ search });
      setProducts(res.data || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  if (loading) return <Loader />;

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <Input placeholder="Search products..." icon={<HiSearch />} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map(p => (
          <button key={p._id} onClick={() => onSelectProduct(p)} disabled={p.quantity <= 0} className={`p-3 border rounded-lg text-left ${p.quantity > 0 ? 'hover:border-blue-500' : 'opacity-50 cursor-not-allowed'}`}>
            <p className="font-medium truncate">{p.name}</p>
            <p className="text-blue-600 font-semibold">{formatCurrency(p.price)}</p>
            <p className="text-xs text-gray-500">Stock: {p.quantity}</p>
          </button>
        ))}
      </div>
    </div>
  );
}