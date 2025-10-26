import React from 'react';

const SetupCard: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default SetupCard;
