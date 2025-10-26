'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../../../components/Icon';

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

export default function SuperadminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();

  const isActive = (path: string): boolean => {
    if (path === '/superadmin') {
      return pathname === path;
    }
    return pathname?.startsWith(path) || false;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <nav className="flex flex-row lg:flex-col lg:w-64 space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2">
        {superadminNavItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center p-3 rounded-md text-sm whitespace-nowrap ${
              isActive(item.path) ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            <Icon name={item.icon} className="mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
