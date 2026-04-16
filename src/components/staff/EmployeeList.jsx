import { useState, useEffect } from 'react';
import { HiPencil, HiTrash, HiSearch } from 'react-icons/hi';
import staffService from '../../services/staffService';
import Loader from '../common/Loader';

export default function EmployeeList({ onEdit, onDelete }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStaff();
  }, [search]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await staffService.getAllStaff({ search });
      setStaff(res.data || []);
    } catch (error) {
      console.error('Failed to load staff', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Department</th>
              <th className="px-6 py-3 text-left">Position</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs">{employee.employeeId}</td>
                <td className="px-6 py-4">{employee.firstName} {employee.lastName}</td>
                <td className="px-6 py-4">{employee.department?.name || '-'}</td>
                <td className="px-6 py-4">{employee.position || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => onEdit(employee)} className="text-blue-600 hover:text-blue-800"><HiPencil /></button>
                    <button onClick={() => onDelete(employee._id)} className="text-red-600 hover:text-red-800"><HiTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}