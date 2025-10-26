'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon from './Icon';
import { useAuth } from '../hooks/useAuth';

const SidebarNext: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Welcome', path: '/welcome', icon: 'home' },
    { name: 'Analytics', path: '/analytics', icon: 'analytics' },
    { name: 'Audiences', path: '/audiences', icon: 'group' },
    { name: 'Activation', path: '/activation', icon: 'send' },
    { name: 'Setup', path: '/setup', icon: 'settings' },
    { name: 'Admin', path: '/admin', icon: 'admin_panel_settings' },
    { name: 'Super Admin', path: '/superadmin', icon: 'security' },
  ];

  const isActive = (path: string): boolean => {
    if (path === '/welcome') {
      return pathname === path;
    }
    return pathname?.startsWith(path) || false;
  };

  const handleLogout = (): void => {
    logout();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-white text-gray-800 flex flex-col shadow-lg h-screen">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Random Truffle</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center p-2 rounded-md transition-colors ${
              isActive(item.path) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            <Icon name={item.icon} className="mr-3" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <Link
          href="/profile"
          className={`flex items-center p-2 rounded-md transition-colors w-full mb-2 ${
            isActive('/profile') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          }`}
        >
          <Icon name="account_circle" className="mr-3" />
          <span>Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center p-2 rounded-md hover:bg-gray-100 w-full text-left"
        >
          <Icon name="logout" className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarNext;
