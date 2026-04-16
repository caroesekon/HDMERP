import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import posService from '../../services/posService';
import CategoryForm from '../../components/pos/CategoryForm';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await posService.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await posService.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  if (loading) return <Loader text="Loading categories..." />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setModal({ type: 'add', data: null })}>
          <HiPlus className="mr-2" />Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-center">Products</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No categories found</td></tr>
            ) : (
              categories.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium">{c.name}</td>
                  <td className="px-6 py-3 text-gray-600">{c.description || '-'}</td>
                  <td className="px-6 py-3 text-center">{c.productCount || 0}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => setModal({ type: 'edit', data: c })} className="text-blue-600">
                        <HiPencil />
                      </button>
                      <button onClick={() => handleDelete(c._id, c.name)} className="text-red-600">
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
        <CategoryForm
          isOpen
          onClose={() => setModal({ type: null, data: null })}
          category={modal.data}
          onSuccess={fetchCategories}
        />
      )}
    </div>
  );
}