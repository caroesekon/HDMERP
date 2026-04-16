import { useState, useEffect } from 'react';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiPrinter, HiEye, HiFilter, HiUserAdd } from 'react-icons/hi';
import staffService from '../../services/staffService';
import EmployeeForm from '../../components/staff/EmployeeForm';
import EmployeeDetails from '../../components/staff/EmployeeDetails';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import { printEmployeeDetails, printEmployeeList } from '../../utils/printUtils';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState({ type: null, data: null });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, search, deptFilter, statusFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await staffService.getAllStaff();
      setEmployees(res.data || []);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await staffService.getDepartments();
      setDepartments(res.data || []);
    } catch (error) {
      console.error('Failed to load departments');
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];
    
    if (search) {
      filtered = filtered.filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (deptFilter) {
      filtered = filtered.filter(e => e.department?._id === deptFilter || e.department?.name === deptFilter);
    }
    
    if (statusFilter === 'active') {
      filtered = filtered.filter(e => e.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(e => !e.isActive);
    }
    
    setFiltered(filtered);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This action cannot be undone.`)) return;
    try {
      await staffService.deleteStaff(id);
      toast.success('Employee deleted');
      fetchEmployees();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handlePrint = (employee) => {
    printEmployeeDetails(employee);
  };

  const handlePrintAll = () => {
    if (filtered.length === 0) {
      toast.error('No employees to print');
      return;
    }
    printEmployeeList(filtered, { 
      department: deptFilter || 'All', 
      status: statusFilter 
    });
  };

  const handleFormSuccess = () => {
    setModal({ type: null, data: null });
    fetchEmployees();
  };

  const resetFilters = () => {
    setSearch('');
    setDeptFilter('');
    setStatusFilter('all');
  };

  if (loading) return <Loader text="Loading employees..." />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Employees ({filtered.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintAll} disabled={filtered.length === 0}>
            <HiPrinter className="mr-2" />
            Print List
          </Button>
          <Button onClick={() => setModal({ type: 'add', data: null })}>
            <HiUserAdd className="mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              icon={<HiSearch />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, ID, Email..."
            />
          </div>
          
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <Button variant="outline" onClick={resetFilters}>
            <HiFilter className="mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Department
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Position
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4 font-mono text-xs whitespace-nowrap">
                      {emp.employeeId}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-xs text-gray-500 md:hidden">
                        {emp.department?.name || '-'}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 hidden md:table-cell">
                      {emp.department?.name || '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 hidden lg:table-cell">
                      {emp.position || '-'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-medium">
                      {formatCurrency(emp.baseSalary)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        emp.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setModal({ type: 'view', data: emp })}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <HiEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setModal({ type: 'edit', data: emp })}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(emp)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Print Details"
                        >
                          <HiPrinter className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id, `${emp.firstName} ${emp.lastName}`)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          Showing {filtered.length} of {employees.length} employees
        </div>
      </div>

      {/* Modals */}
      {modal.type === 'add' && (
        <EmployeeForm
          isOpen
          onClose={() => setModal({ type: null, data: null })}
          onSuccess={handleFormSuccess}
        />
      )}
      
      {modal.type === 'edit' && (
        <EmployeeForm
          isOpen
          employee={modal.data}
          onClose={() => setModal({ type: null, data: null })}
          onSuccess={handleFormSuccess}
        />
      )}
      
      {modal.type === 'view' && (
        <EmployeeDetails
          employee={modal.data}
          onClose={() => setModal({ type: null, data: null })}
        />
      )}
    </div>
  );
}