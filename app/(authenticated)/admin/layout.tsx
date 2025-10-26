'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../../../components/Icon';

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

export default function AdminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();

  const isActive = (path: string): boolean => {
    if (path === '/admin') {
      return pathname === path;
    }
    return pathname?.startsWith(path) || false;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <nav className="flex flex-row lg:flex-col lg:w-64 space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2">
        {adminNavItems.map((item) => (
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
