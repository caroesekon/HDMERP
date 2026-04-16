import { useState, useEffect } from 'react';
import {
  HiPlus, HiPencil, HiTrash, HiSearch, HiOfficeBuilding,
  HiUserGroup, HiChevronRight, HiUsers, HiUser
} from 'react-icons/hi';
import staffService from '../../services/staffService';
import DepartmentForm from '../../components/staff/DepartmentForm';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ type: null, data: null });
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewDetails, setViewDetails] = useState(false);
  const [hierarchy, setHierarchy] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchHierarchy();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [departments, search]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await staffService.getDepartments();
      setDepartments(res.data || []);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const res = await staffService.getDepartmentHierarchy();
      setHierarchy(res.data || []);
    } catch (error) {
      console.error('Failed to load hierarchy');
    }
  };

  const applyFilter = () => {
    if (!search) {
      setFiltered(departments);
    } else {
      setFiltered(departments.filter(d => 
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase())
      ));
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete department "${name}"? This cannot be undone.`)) return;
    try {
      await staffService.deleteDepartment(id);
      toast.success('Department deleted');
      fetchDepartments();
      fetchHierarchy();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  const handleViewDetails = (dept) => {
    setSelectedDept(dept);
    setViewDetails(true);
  };

  const handleFormSuccess = () => {
    setModal({ type: null, data: null });
    fetchDepartments();
    fetchHierarchy();
  };

  const renderHierarchyTree = (items, level = 0) => {
    return items.map(item => (
      <div key={item._id} style={{ marginLeft: level * 20 }}>
        <div className="flex items-center py-2 border-b">
          <HiOfficeBuilding className="h-5 w-5 text-gray-400 mr-2" />
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            {item.manager && (
              <p className="text-xs text-gray-500">
                Manager: {item.manager.firstName} {item.manager.lastName}
              </p>
            )}
          </div>
          <span className="text-sm text-gray-500">{item.employeeCount || 0} employees</span>
        </div>
        {item.children && item.children.length > 0 && renderHierarchyTree(item.children, level + 1)}
      </div>
    ));
  };

  if (loading) return <Loader text="Loading departments..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Departments</h2>
          <p className="text-gray-500 mt-1">Manage organizational structure</p>
        </div>
        <Button onClick={() => setModal({ type: 'add', data: null })}>
          <HiPlus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={HiOfficeBuilding}
          label="Total Departments"
          value={departments.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={HiUsers}
          label="Active Departments"
          value={departments.filter(d => d.isActive).length}
          color="bg-green-500"
        />
        <StatCard
          icon={HiUserGroup}
          label="Total Employees"
          value={departments.reduce((sum, d) => sum + (d.employeeCount || 0), 0)}
          color="bg-purple-500"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Department List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b">
              <Input
                placeholder="Search departments..."
                icon={<HiSearch />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No departments found</p>
              ) : (
                filtered.map((dept) => (
                  <div key={dept._id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <HiOfficeBuilding className="h-5 w-5 text-blue-500 mr-2" />
                          <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                          <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${
                            dept.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {dept.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {dept.description && (
                          <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <HiUser className="h-3 w-3 mr-1" />
                            {dept.employeeCount || 0} employees
                          </span>
                          {dept.manager && (
                            <span>Manager: {dept.manager.firstName} {dept.manager.lastName}</span>
                          )}
                          {dept.parentDepartment && (
                            <span>Parent: {dept.parentDepartment.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-4">
                        <button
                          onClick={() => handleViewDetails(dept)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <HiChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setModal({ type: 'edit', data: dept })}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Edit"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept._id, dept.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Hierarchy Tree */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <HiOfficeBuilding className="h-5 w-5 mr-2 text-green-600" />
            Organization Hierarchy
          </h3>
          <div className="max-h-[500px] overflow-y-auto">
            {hierarchy.length === 0 ? (
              <p className="text-gray-500 text-sm">No departments found</p>
            ) : (
              renderHierarchyTree(hierarchy)
            )}
          </div>
        </div>
      </div>

      {/* Department Form Modal */}
      {modal.type && (
        <DepartmentForm
          isOpen={true}
          onClose={() => setModal({ type: null, data: null })}
          department={modal.data}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={viewDetails}
        onClose={() => { setViewDetails(false); setSelectedDept(null); }}
        title="Department Details"
        size="md"
      >
        {selectedDept && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-lg">{selectedDept.name}</h4>
              <p className="text-gray-600 mt-1">{selectedDept.description || 'No description'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                  selectedDept.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedDept.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Employees</p>
                <p className="font-medium">{selectedDept.employeeCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Manager</p>
                <p className="font-medium">
                  {selectedDept.manager ? 
                    `${selectedDept.manager.firstName} ${selectedDept.manager.lastName}` : 
                    'Not assigned'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Parent Department</p>
                <p className="font-medium">{selectedDept.parentDepartment?.name || 'None'}</p>
              </div>
            </div>

            {selectedDept.subDepartments && selectedDept.subDepartments.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Sub-Departments</p>
                <div className="space-y-1">
                  {selectedDept.subDepartments.map(sub => (
                    <p key={sub._id} className="text-sm">• {sub.name}</p>
                  ))}
                </div>
              </div>
            )}

            {selectedDept.employees && selectedDept.employees.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Employees in this Department</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {selectedDept.employees.map(emp => (
                    <p key={emp._id} className="text-sm">
                      • {emp.firstName} {emp.lastName} - {emp.position || 'No position'}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center">
      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mr-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}