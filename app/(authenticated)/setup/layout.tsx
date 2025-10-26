'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../../../components/Icon';

const setupNavItems = [
  { name: 'Overview', path: '/setup', icon: 'visibility' },
  { name: 'Data Sources', path: '/setup/data-sources', icon: 'database' },
  { name: 'MCP Servers', path: '/setup/mcp-servers', icon: 'dns' },
  { name: 'Activation', path: '/setup/activation', icon: 'publish' },
  { name: 'Security', path: '/setup/security', icon: 'security' },
  { name: 'Observability', path: '/setup/observability', icon: 'monitoring' },
  { name: 'Infrastructure', path: '/setup/infra', icon: 'cloud' },
];

export default function SetupLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();

  const isActive = (path: string): boolean => {
    if (path === '/setup') {
      return pathname === path;
    }
    return pathname?.startsWith(path) || false;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <nav className="flex flex-row lg:flex-col lg:w-64 space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2">
        {setupNavItems.map((item) => (
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
