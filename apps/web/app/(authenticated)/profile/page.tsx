'use client';

import PageHeader from '../../../components/ui/PageHeader';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card';

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Profile" subtitle="Manage your account settings." />
      <Card>
        {user ? (
          <div>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        ) : (
          <p>Not logged in.</p>
        )}
      </Card>
    </div>
  );
}
