import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Step4_Preview: React.FC = () => {
  const context = useContext(CreateAudienceContext);
  if (!context) return null;
  const { nextStep, prevStep } = context;

  return (
    <Card>
      <h2 className="text-xl font-semibold">Step 4: Preview Audience</h2>
      <p className="mt-2 text-gray-600">
        See a preview of the audience size and some sample users.
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

export default Step4_Preview;
