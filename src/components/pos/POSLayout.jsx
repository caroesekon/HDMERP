import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  HiHome, HiCube, HiShoppingBag, HiUsers, HiClipboardList, HiChartBar,
  HiMenu, HiX, HiChevronRight, HiCog, HiClock, HiCash
} from 'react-icons/hi';
import { usePOSAuth } from '../../context/POSAuthContext';
import { useModuleSettings } from '../../hooks/useModuleSettings';
import POSProfileDropdown from './POSProfileDropdown';

const navItems = [
  { name: 'Dashboard', href: '/pos', icon: HiHome },
  { name: 'Products', href: '/pos/products', icon: HiCube },
  { name: 'Categories', href: '/pos/categories', icon: HiClipboardList },
  { name: 'Sales', href: '/pos/sales', icon: HiShoppingBag },
  { name: 'Customers', href: '/pos/customers', icon: HiUsers },
  { name: 'Inventory', href: '/pos/inventory', icon: HiClipboardList },
  { name: 'Accounts', href: '/pos/accounts', icon: HiCash },
  { name: 'Reports', href: '/pos/reports', icon: HiChartBar },
  { name: 'Settings', href: '/pos/settings', icon: HiCog },
];

export default function POSLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = usePOSAuth();
  const { appName, logo } = useModuleSettings('pos', 'POS System');
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [sidebarOpen]);

  const formatTime = (date) => date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (date) => date.toLocaleDateString('en-KE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-md sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-md text-white hover:bg-blue-800">
                <HiMenu className="h-6 w-6" />
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                {logo ? <img src={logo} alt={appName} className="h-8 w-auto" /> : <HiShoppingBag className="h-8 w-8 text-white" />}
                <div className="ml-3">
                  <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">{appName}</h1>
                  <p className="text-xs text-blue-100 hidden sm:block">Point of Sale System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:block text-right mr-4">
                <div className="text-white text-sm font-medium flex items-center">
                  <HiClock className="h-4 w-4 mr-1" />{formatTime(currentTime)}
                </div>
                <div className="text-blue-100 text-xs">{formatDate(currentTime)}</div>
              </div>
              <Link to="/" className="text-xs sm:text-sm text-white/80 hover:text-white px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-800 transition">
                Hub
              </Link>
              
              {/* Profile Dropdown */}
              <POSProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-md min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/pos' && location.pathname.startsWith(item.href));
              return (
                <Link key={item.name} to={item.href} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85%] bg-white shadow-xl transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {logo ? <img src={logo} alt={appName} className="h-6 w-auto" /> : <HiShoppingBag className="h-6 w-6 text-white" />}
                    <div className="ml-2">
                      <h2 className="text-lg font-semibold text-white">{appName}</h2>
                      <p className="text-xs text-blue-100">Point of Sale System</p>
                    </div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 text-white/80 hover:text-white">
                    <HiX className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-3 text-blue-100 text-sm">
                  <p>{user?.name}</p>
                  <div className="flex items-center text-xs mt-1">
                    <HiClock className="h-3 w-3 mr-1" />{formatTime(currentTime)} · {formatDate(currentTime)}
                  </div>
                </div>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href || (item.href !== '/pos' && location.pathname.startsWith(item.href));
                  return (
                    <Link key={item.name} to={item.href} className={`flex items-center justify-between px-4 py-3 rounded-lg ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                      <div className="flex items-center space-x-3"><item.icon className="h-5 w-5" /><span>{item.name}</span></div>
                      <HiChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto"><Outlet /></div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-20">
        <div className="grid grid-cols-5 h-16">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/pos' && location.pathname.startsWith(item.href));
            return (
              <Link key={item.name} to={item.href} className={`flex flex-col items-center justify-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                <item.icon className="h-5 w-5 mb-0.5" />
                <span className="text-[10px] font-medium truncate px-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}