import { useState, useEffect } from 'react';
import { HiUser, HiLockClosed, HiUsers, HiLogout, HiChevronDown, HiPlus, HiTrash } from 'react-icons/hi';
import { useStaffAuth } from '../../context/StaffAuthContext';
import staffAuthService from '../../services/staffAuthService';
import staffService from '../../services/staffService';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function StaffProfileDropdown() {
  const { user, logout } = useStaffAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [userForm, setUserForm] = useState({ open: false, user: null });
  const [userFormData, setUserFormData] = useState({ name: '', email: '', password: '', role: 'hr' });

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (showUserManagement && isAdmin) {
      fetchUsers();
    }
  }, [showUserManagement, isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await staffService.getUsers?.() || { data: [] };
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await staffAuthService.changePassword(passwordData.current, passwordData.new);
      toast.success('Password changed');
      setShowChangePassword(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await staffAuthService.register(userFormData.name, userFormData.email, userFormData.password, userFormData.role);
      toast.success('User created');
      setUserForm({ open: false, user: null });
      setUserFormData({ name: '', email: '', password: '', role: 'hr' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await staffService.updateUserRole?.(userId, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await staffService.toggleUserStatus?.(userId);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Delete "${userName}"?`)) return;
    try {
      await staffService.deleteUser?.(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed');
    }
  };

  return (
    <>
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-green-800 transition">
          <div className="h-8 w-8 rounded-full bg-green-300 flex items-center justify-center text-green-800 font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-white hidden md:block">{user?.name}</span>
          <HiChevronDown className={`h-4 w-4 text-white transition ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                user?.role === 'manager' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.role}
              </span>
            </div>
            
            <button onClick={() => { setShowChangePassword(true); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
              <HiLockClosed className="h-4 w-4 mr-2" /> Change Password
            </button>
            
            {isAdmin && (
              <button onClick={() => { setShowUserManagement(true); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                <HiUsers className="h-4 w-4 mr-2" /> Manage Users
              </button>
            )}
            
            <div className="border-t border-gray-200 my-1"></div>
            
            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
              <HiLogout className="h-4 w-4 mr-2" /> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <Modal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password" size="md">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input label="Current Password" type="password" value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} required />
          <Input label="New Password" type="password" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} required />
          <Input label="Confirm Password" type="password" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} required />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowChangePassword(false)}>Cancel</Button>
            <Button type="submit" loading={loading}>Update</Button>
          </div>
        </form>
      </Modal>

      {/* User Management Modal - Same structure as POS */}
      <Modal isOpen={showUserManagement} onClose={() => setShowUserManagement(false)} title="Manage Users" size="lg">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setUserForm({ open: true, user: null })}><HiPlus className="mr-1" /> Add User</Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr><th className="px-3 py-2">Name</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Role</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u._id}>
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    <select value={u.role} onChange={e => handleUpdateUserRole(u._id, e.target.value)} className="text-xs border rounded px-2 py-1">
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="hr">HR</option>
                      <option value="staff">Staff</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => handleToggleUserStatus(u._id, u.isActive)} className={`px-2 py-1 text-xs rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => handleDeleteUser(u._id, u.name)} className="text-red-600"><HiTrash className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={userForm.open} onClose={() => setUserForm({ open: false, user: null })} title="Add User" size="md">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input label="Name" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} required />
          <Input label="Email" type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} required />
          <Input label="Password" type="password" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} required />
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})} className="w-full border rounded-lg px-3 py-2">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setUserForm({ open: false, user: null })}>Cancel</Button>
            <Button type="submit" loading={loading}>Create</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}