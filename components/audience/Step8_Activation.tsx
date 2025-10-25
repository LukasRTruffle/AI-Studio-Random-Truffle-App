import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Step8_Activation: React.FC = () => {
    const context = useContext(CreateAudienceContext);
    if (!context) return null;
    const { nextStep, prevStep } = context;

    return (
        <Card>
            <h2 className="text-xl font-semibold">Step 8: Configure Activation</h2>
            <p className="mt-2 text-gray-600">Choose where and how to activate this audience.</p>
            <div className="mt-6 flex justify-between">
                <Button onClick={prevStep} variant="secondary">Previous Step</Button>
                <Button onClick={nextStep}>Next Step</Button>
            </div>
        </Card>
    );
};

export default Step8_Activation;
