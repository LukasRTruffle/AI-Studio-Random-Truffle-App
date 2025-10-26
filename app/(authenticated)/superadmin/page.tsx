'use client';

import PageHeader from '../../../components/ui/PageHeader';

export default function SuperadminOverviewPage(): JSX.Element {
  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Overview" subtitle="Manage platform-wide settings and tenants" />
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Platform Overview</h3>
        <p>
          This dashboard shows a high-level overview of the entire platform, including tenant count,
          total users, and system health.
        </p>
      </div>
    </div>
  );
}
