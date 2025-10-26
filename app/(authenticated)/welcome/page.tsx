'use client';

import PageHeader from '../../../components/ui/PageHeader';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/ui/Card';

export default function WelcomePage(): JSX.Element {
  const { user } = useAuth();
  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title={`Welcome, ${user?.name || 'User'}!`}
        subtitle="This is your Random Truffle dashboard - AI-driven marketing intelligence and activation platform."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold">Getting Started</h2>
          <p className="mt-2 text-gray-600">
            Use the sidebar to navigate through the different sections of the application. You can
            view analytics, manage audiences, configure activations, and more.
          </p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">What is Random Truffle?</h2>
          <p className="mt-2 text-gray-600">
            Random Truffle is an enterprise AI-driven marketing intelligence and activation platform
            with audience building, multi-channel activation, and advanced analytics powered by
            Vertex AI.
          </p>
        </Card>
      </div>
    </div>
  );
}
