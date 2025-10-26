import React from 'react';
import SetupCard from '../../components/setup/SetupCard';

const SetupSecurity: React.FC = () => {
  return (
    <SetupCard title="Security">
      <p>Review and configure security settings, IAM permissions, and VPC-SC.</p>
    </SetupCard>
  );
};

export default SetupSecurity;
