import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiShoppingCart, HiUsers, HiCurrencyDollar, HiCog } from 'react-icons/hi';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: HiHome },
  { name: 'POS', href: '/pos', icon: HiShoppingCart },
  { name: 'Staff', href: '/staff', icon: HiUsers },
  { name: 'Finance', href: '/finance', icon: HiCurrencyDollar },
  { name: 'Settings', href: '/settings', icon: HiCog },
];

export default function MobileBottomNav() {
  const location = useLocation();
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center text-xs ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}