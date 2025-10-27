import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navItems = [
    { name: 'Welcome', path: '/', icon: 'home' },
    { name: 'Analytics', path: '/analytics', icon: 'analytics' },
    { name: 'Audiences', path: '/audiences', icon: 'group' },
    { name: 'Activation', path: '/activation', icon: 'send' },
    { name: 'Setup', path: '/setup', icon: 'settings' },
    { name: 'Admin', path: '/admin', icon: 'admin_panel_settings' },
    { name: 'Super Admin', path: '/superadmin', icon: 'security' },
  ];

  return (
    <div className="w-64 bg-white text-gray-800 flex flex-col shadow-lg">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">Builder</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md transition-colors ${
                isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`
            }
          >
            <Icon name={item.icon} className="mr-3" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center p-2 rounded-md transition-colors w-full mb-2 ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`
          }
        >
          <Icon name="account_circle" className="mr-3" />
          <span>Profile</span>
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center p-2 rounded-md hover:bg-gray-100 w-full text-left"
        >
          <Icon name="logout" className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
