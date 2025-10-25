import React from 'react';
import SetupCard from '../../components/setup/SetupCard';

const SetupDataSources: React.FC = () => {
  return (
    <SetupCard title="Data Sources">
      <p>Manage and test connections to your data sources like BigQuery, etc.</p>
    </SetupCard>
  );
};

export default SetupDataSources;
