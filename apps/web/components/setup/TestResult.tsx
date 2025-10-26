import React from 'react';
import Icon from '../Icon';

interface TestResultProps {
  title: string;
  status: 'success' | 'failure' | 'warning';
  message: string;
}

const TestResult: React.FC<TestResultProps> = ({ title, status, message }) => {
  const statusConfig = {
    success: { icon: 'check_circle', color: 'text-green-500' },
    failure: { icon: 'cancel', color: 'text-red-500' },
    warning: { icon: 'warning', color: 'text-yellow-500' },
  };

  return (
    <div className="flex items-start p-4 border rounded-md mb-2">
      <Icon name={statusConfig[status].icon} className={`${statusConfig[status].color} mr-4`} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default TestResult;
