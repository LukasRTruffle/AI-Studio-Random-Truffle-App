import React, { createContext, useState, ReactNode } from 'react';

interface AudienceState {
  description: string;
  strategy: string;
  // Add other state properties as needed for the wizard
}

interface CreateAudienceContextType {
  currentStep: number;
  audienceState: AudienceState;
  setAudienceState: React.Dispatch<React.SetStateAction<AudienceState>>;
  nextStep: () => void;
  prevStep: () => void;
}

export const CreateAudienceContext = createContext<CreateAudienceContextType | undefined>(undefined);

export const CreateAudienceProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [audienceState, setAudienceState] = useState<AudienceState>({
    description: '',
    strategy: '',
  });

  const nextStep = () => setCurrentStep(prev => (prev < 10 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

  return (
    <CreateAudienceContext.Provider value={{ currentStep, audienceState, setAudienceState, nextStep, prevStep }}>
      {children}
    </CreateAudienceContext.Provider>
  );
};
