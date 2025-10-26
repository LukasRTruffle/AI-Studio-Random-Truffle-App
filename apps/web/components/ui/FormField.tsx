import React from 'react';

interface FormFieldProps {
  label: string;
  helpText?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, helpText, children }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">{children}</div>
      {helpText && <p className="mt-2 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

export default FormField;
