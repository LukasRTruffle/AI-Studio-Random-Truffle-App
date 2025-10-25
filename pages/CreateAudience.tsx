import React, { useContext } from 'react';
import { CreateAudienceContext } from '../contexts/CreateAudienceContext';
import StepIndicator from '../components/audience/StepIndicator';
import Step1_Describe from '../components/audience/Step1_Describe';
import Step2_Strategy from '../components/audience/Step2_Strategy';
import Step3_SqlCheck from '../components/audience/Step3_SqlCheck';
import Step4_Preview from '../components/audience/Step4_Preview';
import Step5_Metadata from '../components/audience/Step5_Metadata';
import Step6_Consent from '../components/audience/Step6_Consent';
import Step7_Create from '../components/audience/Step7_Create';
import Step8_Activation from '../components/audience/Step8_Activation';
import Step9_DryRun from '../components/audience/Step9_DryRun';
import Step10_Monitor from '../components/audience/Step10_Monitor';
import PageHeader from '../components/ui/PageHeader';

const CreateAudience: React.FC = () => {
    const context = useContext(CreateAudienceContext);
    if (!context) {
        return <div>Loading Audience Creator...</div>;
    }
    const { currentStep } = context;

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1_Describe />;
            case 2: return <Step2_Strategy />;
            case 3: return <Step3_SqlCheck />;
            case 4: return <Step4_Preview />;
            case 5: return <Step5_Metadata />;
            case 6: return <Step6_Consent />;
            case 7: return <Step7_Create />;
            case 8: return <Step8_Activation />;
            case 9: return <Step9_DryRun />;
            case 10: return <Step10_Monitor />;
            default: return <Step1_Describe />;
        }
    };

    return (
        <div className="p-6 md:p-10">
            <PageHeader title="Create New Audience" subtitle="Follow the steps to define, create, and activate your audience." />
            <div className="mb-8">
                <StepIndicator />
            </div>
            <div>
                {renderStep()}
            </div>
        </div>
    );
};

export default CreateAudience;
