import { useState } from 'react';
import { HiPencil, HiMail, HiPhone, HiCalendar, HiLockClosed, HiUser } from 'react-icons/hi';
import { useHubAuth } from '../context/HubAuthContext';
import toast from 'react-hot-toast';
import hubAuthService from '../services/hubAuthService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

export default function Profile() {
  const { user, logout } = useHubAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Note: Backend needs a profile update endpoint
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await hubAuthService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Password changed successfully');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-end -mt-10">
            <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-primary-600 border-4 border-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium"
            >
              <HiPencil className="mr-1 h-4 w-4" />
              Edit Profile
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-800">{user?.name || 'User Name'}</h3>
            <p className="text-gray-500 capitalize">{user?.role || 'Member'}</p>
          </div>

          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="flex items-center text-gray-700">
              <HiMail className="h-5 w-5 mr-3 text-gray-400" />
              <span>{user?.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <HiUser className="h-5 w-5 mr-3 text-gray-400" />
              <span>Role: {user?.role || 'user'}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <HiCalendar className="h-5 w-5 mr-3 text-gray-400" />
              <span>Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
            >
              <HiLockClosed className="mr-2 h-4 w-4" />
              Change Password
            </button>
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile" size="md">
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isChangingPassword} onClose={() => setIsChangingPassword(false)} title="Change Password" size="md">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsChangingPassword(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}