'use client';

import PageHeader from '../../../components/ui/PageHeader';

export default function ActivationPage(): JSX.Element {
  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Activation" subtitle="Configure and manage audience activations." />
      <div className="mt-6 p-6 bg-white rounded-lg shadow">
        <p>Activation configuration and history will be displayed here.</p>
      </div>
    </div>
  );
}
