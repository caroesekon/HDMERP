import { useState } from 'react';
import { useHubAuth } from '../context/HubAuthContext';
import { HiUser, HiBell, HiLockClosed, HiGlobe, HiMoon, HiSun } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Settings() {
  const { user } = useHubAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: HiUser },
    { id: 'notifications', name: 'Notifications', icon: HiBell },
    { id: 'security', name: 'Security', icon: HiLockClosed },
    { id: 'appearance', name: 'Appearance', icon: HiGlobe }
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Implement profile update API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      // TODO: Implement password change API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast.success(`Theme set to ${newTheme}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-md">
              <h3 className="font-medium text-gray-800">Notification Preferences</h3>
              <label className="flex items-center justify-between py-2">
                <span className="text-gray-700">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between py-2 border-t">
                <span className="text-gray-700">Push Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              <label className="flex items-center justify-between py-2 border-t">
                <span className="text-gray-700">SMS Alerts</span>
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </label>
              <div className="flex justify-end pt-4">
                <Button onClick={() => toast.success('Preferences saved')}>
                  Save Preferences
                </Button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <h3 className="font-medium text-gray-800 mb-4">Change Password</h3>
              <Input
                label="Current Password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" loading={loading}>
                  Update Password
                </Button>
              </div>
            </form>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4 max-w-md">
              <h3 className="font-medium text-gray-800 mb-4">Theme</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 p-4 rounded-xl border-2 transition ${
                    theme === 'light'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <HiSun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="font-medium">Light</p>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 p-4 rounded-xl border-2 transition ${
                    theme === 'dark'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <HiMoon className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                  <p className="font-medium">Dark</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}