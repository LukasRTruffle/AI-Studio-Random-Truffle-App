import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Icon from '../components/Icon';
import AdminUsers from './admin/AdminUsers';
// Import other admin pages

const adminNavItems = [
    { name: 'Users', path: '/admin', icon: 'group' },
    { name: 'Tenants', path: '/admin/tenants', icon: 'corporate_fare' },
    { name: 'Agents', path: '/admin/agents', icon: 'smart_toy' },
    { name: 'Secrets', path: '/admin/secrets', icon: 'key' },
    { name: 'Prompts', path: '/admin/prompts', icon: 'edit_note' },
    { name: 'Quotas', path: '/admin/quotas', icon: 'request_quote' },
    { name: 'Governance', path: '/admin/governance', icon: 'gavel' },
    { name: 'Incidents', path: '/admin/incidents', icon: 'crisis_alert' },
    { name: 'Billing', path: '/admin/billing', icon: 'receipt_long' },
    { name: 'SLOs', path: '/admin/slos', icon: 'monitoring' },
];


const Admin: React.FC = () => {
  const location = useLocation();
  const currentTitle = adminNavItems.find(item => item.path === location.pathname)?.name || 'Admin';

  return (
    <div className="p-6 md:p-10">
      <PageHeader title={currentTitle} subtitle="Manage tenant-level settings and users" />
       <div className="flex flex-col lg:flex-row gap-6">
          <nav className="flex flex-row lg:flex-col lg:w-64 space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2">
              {adminNavItems.map(item => (
                  <NavLink key={item.path} to={item.path} end={item.path === '/admin'} className={({isActive}) => `flex items-center p-3 rounded-md text-sm whitespace-nowrap ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                      <Icon name={item.icon} className="mr-3" />
                      {item.name}
                  </NavLink>
              ))}
          </nav>
          <div className="flex-1">
              <Routes>
                  <Route index element={<AdminUsers />} />
                  {/* Add routes for other admin pages here */}
              </Routes>
          </div>
      </div>
    </div>
  );
};

export default Admin;
