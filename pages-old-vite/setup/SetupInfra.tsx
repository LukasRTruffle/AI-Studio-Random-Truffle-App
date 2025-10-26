import React from 'react';
import SetupCard from '../../components/setup/SetupCard';

const SetupInfra: React.FC = () => {
  return (
    <SetupCard title="Infrastructure">
      <p>Review the status of the underlying GCP infrastructure components.</p>
    </SetupCard>
  );
};

export default SetupInfra;
