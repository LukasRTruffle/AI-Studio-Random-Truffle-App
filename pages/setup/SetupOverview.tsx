import React from 'react';
import SetupCard from '../../components/setup/SetupCard';

const SetupOverview: React.FC = () => {
  return (
    <SetupCard title="Setup Overview">
      <p>This page provides a summary of all system checks and their statuses.</p>
    </SetupCard>
  );
};

export default SetupOverview;
