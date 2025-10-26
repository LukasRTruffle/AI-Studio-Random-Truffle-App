import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Step3_SqlCheck: React.FC = () => {
  const context = useContext(CreateAudienceContext);
  if (!context) return null;
  const { nextStep, prevStep } = context;

  return (
    <Card>
      <h2 className="text-xl font-semibold">Step 3: Validate SQL</h2>
      <p className="mt-2 text-gray-600">
        Review the generated SQL query for correctness and efficiency.
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

export default Step3_SqlCheck;
