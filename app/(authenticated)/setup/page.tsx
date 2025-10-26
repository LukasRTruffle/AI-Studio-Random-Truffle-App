'use client';

import PageHeader from '../../../components/ui/PageHeader';
import SetupCard from '../../../components/setup/SetupCard';

export default function SetupOverviewPage(): JSX.Element {
  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Overview" subtitle="System configuration and health checks" />
      <SetupCard title="Setup Overview">
        <p>This page provides a summary of all system checks and their statuses.</p>
      </SetupCard>
    </div>
  );
}
