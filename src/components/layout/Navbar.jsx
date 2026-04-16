import { HiMenu, HiX, HiOutlineLogout } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="header-gradient shadow-md sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-white hover:bg-primary-800 focus:outline-none"
            >
              {sidebarOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-bold text-white ml-2 lg:ml-0">ERP Hub</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/90 hidden sm:block">
              {user?.name || 'User'}
            </span>
            <div className="relative group">
              <button className="h-8 w-8 rounded-full bg-primary-300 flex items-center justify-center text-primary-800 font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <HiOutlineLogout className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}