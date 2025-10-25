import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Step10_Monitor: React.FC = () => {
    const context = useContext(CreateAudienceContext);
    if (!context) return null;
    const { prevStep } = context;

    return (
        <Card>
            <h2 className="text-xl font-semibold">Step 10: Monitor</h2>
            <p className="mt-2 text-gray-600">The audience is being created and activated. Monitor the progress here.</p>
            <div className="mt-6 flex justify-between">
                <Button onClick={prevStep} variant="secondary">Previous Step</Button>
                <Button onClick={() => alert("Done!")}>Finish</Button>
            </div>
        </Card>
    );
};

export default Step10_Monitor;
