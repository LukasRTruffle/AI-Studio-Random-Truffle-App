import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Card from '../ui/Card';
import FormField from '../ui/FormField';

const Step1_Describe: React.FC = () => {
  const context = useContext(CreateAudienceContext);
  if (!context) return null;

  const { audienceState, setAudienceState, nextStep } = context;

  const handleNext = () => {
    if (!audienceState.description.trim()) {
      alert('Please describe your audience.');
      return;
    }
    nextStep();
  };

  return (
    <Card>
      <FormField
        label="Describe Your Audience"
        helpText="Use natural language to describe the segment of users you want to target. Be as specific as possible."
      >
        <Textarea
          value={audienceState.description}
          onChange={(e) => setAudienceState((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="e.g., 'Users who have purchased at least 3 times in the last 90 days and live in California, but have not opened our last 3 emails.'"
          className="w-full"
          rows={6}
        />
      </FormField>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleNext} disabled={!audienceState.description.trim()}>
          Next Step
        </Button>
      </div>
    </Card>
  );
};

export default Step1_Describe;
