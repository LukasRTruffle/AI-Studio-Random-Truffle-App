import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Step9_DryRun: React.FC = () => {
  const context = useContext(CreateAudienceContext);
  if (!context) return null;
  const { nextStep, prevStep } = context;

  return (
    <Card>
      <h2 className="text-xl font-semibold">Step 9: Dry Run</h2>
      <p className="mt-2 text-gray-600">
        Perform a dry run of the activation to ensure everything is configured correctly.
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

export default Step9_DryRun;
