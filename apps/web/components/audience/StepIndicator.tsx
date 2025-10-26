import React, { useContext } from 'react';
import { CreateAudienceContext } from '../../contexts/CreateAudienceContext';

const StepIndicator: React.FC = () => {
  const context = useContext(CreateAudienceContext);
  const steps = [
    'Describe',
    'Strategy',
    'SQL Check',
    'Preview',
    'Metadata',
    'Consent',
    'Create',
    'Activation',
    'Dry Run',
    'Monitor',
  ];

  if (!context) return null;
  const { currentStep } = context;

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((stepName, index) => (
          <li
            key={stepName}
            className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}
          >
            {currentStep > index + 1 ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-blue-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <p className="text-white">{index + 1}</p>
                </div>
              </>
            ) : currentStep === index + 1 ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" aria-hidden="true" />
                </div>
                <span className="absolute -bottom-6 text-sm font-medium text-blue-600">
                  {stepName}
                </span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                  <p className="text-gray-500">{index + 1}</p>
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;
