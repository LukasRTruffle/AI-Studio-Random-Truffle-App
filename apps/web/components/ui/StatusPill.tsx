import React from 'react';

interface StatusPillProps {
  status: 'active' | 'inactive' | 'draft';
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusPill;
