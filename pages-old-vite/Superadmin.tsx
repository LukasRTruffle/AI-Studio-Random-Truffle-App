import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Icon from '../components/Icon';
import SuperadminOverview from './superadmin/SuperadminOverview';
// Import other superadmin pages

const superadminNavItems = [
  { name: 'Overview', path: '/superadmin', icon: 'dashboard' },
  { name: 'Tenants', path: '/superadmin/tenants', icon: 'corporate_fare' },
  { name: 'Provisioning', path: '/superadmin/provisioning', icon: 'add_business' },
  { name: 'Policies', path: '/superadmin/policies', icon: 'policy' },
  { name: 'Agents', path: '/superadmin/agents', icon: 'hub' },
  { name: 'Endpoints', path: '/superadmin/endpoints', icon: 'settings_ethernet' },
  { name: 'Quotas', path: '/superadmin/quotas', icon: 'request_quote' },
  { name: 'Observability', path: '/superadmin/observability', icon: 'monitoring' },
  { name: 'Secrets', path: '/superadmin/secrets', icon: 'key' },
  { name: 'Disaster Recovery', path: '/superadmin/dr', icon: 'emergency' },
  { name: 'Audit Logs', path: '/superadmin/audit', icon: 'summarize' },
  { name: 'Change Mgmt', path: '/superadmin/change', icon: 'change_history' },
];

const Superadmin: React.FC = () => {
  const location = useLocation();
  const currentTitle =
    superadminNavItems.find((item) => item.path === location.pathname)?.name || 'Super Admin';
  return (
    <div className="p-6 md:p-10">
      <PageHeader title={currentTitle} subtitle="Manage platform-wide settings and tenants" />
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="flex flex-row lg:flex-col lg:w-64 space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2">
          {superadminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/superadmin'}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md text-sm whitespace-nowrap ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`
              }
            >
              <Icon name={item.icon} className="mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1">
          <Routes>
            <Route index element={<SuperadminOverview />} />
            {/* Add routes for other superadmin pages here */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Superadmin;
