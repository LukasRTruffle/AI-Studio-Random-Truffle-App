import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Icon from '../components/Icon';
import SetupOverview from './setup/SetupOverview';
import SetupDataSources from './setup/SetupDataSources';
import SetupMcpServers from './setup/SetupMcpServers';
import SetupActivation from './setup/SetupActivation';
import SetupSecurity from './setup/SetupSecurity';
import SetupObservability from './setup/SetupObservability';
import SetupInfra from './setup/SetupInfra';


const setupNavItems = [
    { name: 'Overview', path: '/setup', icon: 'visibility' },
    { name: 'Data Sources', path: '/setup/data-sources', icon: 'database' },
    { name: 'MCP Servers', path: '/setup/mcp-servers', icon: 'dns' },
    { name: 'Activation', path: '/setup/activation', icon: 'publish' },
    { name: 'Security', path: '/setup/security', icon: 'security' },
    { name: 'Observability', path: '/setup/observability', icon: 'monitoring' },
    { name: 'Infrastructure', path: '/setup/infra', icon: 'cloud' },
];

const Setup: React.FC = () => {
    const location = useLocation();
    const currentTitle = setupNavItems.find(item => item.path === location.pathname)?.name || 'Setup';

    return (
        <div className="p-6 md:p-10">
            <PageHeader title={currentTitle} subtitle="System configuration and health checks" />
            <div className="flex flex-col lg:flex-row gap-6">
                <nav className="flex flex-row lg:flex-col lg:w-64 space-x-2 lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2">
                    {setupNavItems.map(item => (
                        <NavLink key={item.path} to={item.path} end={item.path === '/setup'} className={({isActive}) => `flex items-center p-3 rounded-md text-sm whitespace-nowrap ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>
                            <Icon name={item.icon} className="mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="flex-1">
                    <Routes>
                        <Route index element={<SetupOverview />} />
                        <Route path="data-sources" element={<SetupDataSources />} />
                        <Route path="mcp-servers" element={<SetupMcpServers />} />
                        <Route path="activation" element={<SetupActivation />} />
                        <Route path="security" element={<SetupSecurity />} />
                        <Route path="observability" element={<SetupObservability />} />
                        <Route path="infra" element={<SetupInfra />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default Setup;
