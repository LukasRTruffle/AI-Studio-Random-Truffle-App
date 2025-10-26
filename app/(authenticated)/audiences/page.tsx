'use client';

import { useRouter } from 'next/navigation';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';
import StatusPill from '../../../components/ui/StatusPill';
import { audienceData } from '../../../data/mockData';
import { Audience } from '../../../types';
import Icon from '../../../components/Icon';

export default function AudiencesPage(): JSX.Element {
  const router = useRouter();

  const headers = ['Name', 'Size', 'Status', 'Created', 'Last Updated'];
  const rows = audienceData.map((audience: Audience) => [
    audience.name,
    audience.size.toLocaleString(),
    <StatusPill key={audience.id} status={audience.status} />,
    audience.createdDate,
    audience.lastUpdated,
  ]);

  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Audiences">
        <Button onClick={() => router.push('/audiences/create')}>
          <div className="flex items-center">
            <Icon name="add" className="mr-2" />
            <span>Create Audience</span>
          </div>
        </Button>
      </PageHeader>
      <DataTable title="All Audiences" headers={headers} rows={rows} />
    </div>
  );
}
