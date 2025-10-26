import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Step5_Metadata: React.FC = () => {
  const context = useContext(CreateAudienceContext);
  if (!context) return null;
  const { nextStep, prevStep } = context;

  return (
    <Card>
      <h2 className="text-xl font-semibold">Step 5: Add Metadata</h2>
      <p className="mt-2 text-gray-600">
        Provide a name, description, and other metadata for your audience.
      </p>
      <div className="mt-6 flex justify-between">
        <Button onClick={prevStep} variant="secondary">
          Previous Step
        </Button>
        <Button onClick={nextStep}>Next Step</Button>
      </div>
    </Card>
  );
};

export default Step5_Metadata;
