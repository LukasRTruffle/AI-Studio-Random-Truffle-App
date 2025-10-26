'use client';

import PageHeader from '../../../components/ui/PageHeader';

export default function AdminUsersPage() {
  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Users" subtitle="Manage tenant-level settings and users" />
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">User Management</h3>
        <p>Here you can add, remove, and manage users for this tenant.</p>
      </div>
    </div>
  );
}
