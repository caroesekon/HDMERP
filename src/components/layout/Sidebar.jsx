import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiShoppingCart, HiUsers, HiCurrencyDollar, HiCog } from 'react-icons/hi';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HiHome },
  { name: 'POS', href: '/pos', icon: HiShoppingCart },
  { name: 'Staff', href: '/staff', icon: HiUsers },
  { name: 'Finance', href: '/finance', icon: HiCurrencyDollar },
  { name: 'Settings', href: '/settings', icon: HiCog },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  
  const NavLink = ({ item }) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    return (
      <Link
        to={item.href}
        onClick={onClose}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary-50 text-primary-700 font-medium' 
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white shadow-md min-h-[calc(100vh-4rem)] sticky top-16">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}