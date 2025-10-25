import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Step6_Consent: React.FC = () => {
    const context = useContext(CreateAudienceContext);
    if (!context) return null;
    const { nextStep, prevStep } = context;

    return (
        <Card>
            <h2 className="text-xl font-semibold">Step 6: Consent & Compliance</h2>
            <p className="mt-2 text-gray-600">Review and confirm that the audience complies with privacy and consent policies.</p>
            <div className="mt-6 flex justify-between">
                <Button onClick={prevStep} variant="secondary">Previous Step</Button>
                <Button onClick={nextStep}>Next Step</Button>
            </div>
        </Card>
    );
};

export default Step6_Consent;
