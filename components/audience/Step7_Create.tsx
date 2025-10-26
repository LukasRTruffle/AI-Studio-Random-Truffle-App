import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Step7_Create: React.FC = () => {
  const context = useContext(CreateAudienceContext);
  if (!context) return null;
  const { nextStep, prevStep } = context;

  return (
    <Card>
      <h2 className="text-xl font-semibold">Step 7: Create Audience</h2>
      <p className="mt-2 text-gray-600">Final confirmation to create the audience in the system.</p>
      <div className="mt-6 flex justify-between">
        <Button onClick={prevStep} variant="secondary">
          Previous Step
        </Button>
        <Button onClick={nextStep}>Create Audience</Button>
      </div>
    </Card>
  );
};

export default Step7_Create;
