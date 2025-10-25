import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';

const Welcome: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="p-6 md:p-10">
      <PageHeader title={`Welcome, ${user?.name || 'User'}!`} subtitle="This is your Builder dashboard." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold">Getting Started</h2>
          <p className="mt-2 text-gray-600">
            Use the sidebar to navigate through the different sections of the application.
            You can view analytics, manage audiences, configure activations, and more.
          </p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">What is Builder?</h2>
          <p className="mt-2 text-gray-600">
            Builder is an AI-powered platform to help you create, manage, and activate customer audiences with unparalleled speed and precision.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;
