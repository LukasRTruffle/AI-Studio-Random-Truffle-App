import React from 'react';

interface RemediationStepProps {
  step: number;
  description: string;
}

const RemediationStep: React.FC<RemediationStepProps> = ({ step, description }) => {
  return (
    <div className="flex items-center mb-2">
      <div className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-3">
        {step}
      </div>
      <p>{description}</p>
    </div>
  );
};

export default RemediationStep;
