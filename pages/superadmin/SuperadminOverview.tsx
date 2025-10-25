import React from 'react';

const SuperadminOverview: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Platform Overview</h3>
      <p>This dashboard shows a high-level overview of the entire platform, including tenant count, total users, and system health.</p>
    </div>
  );
};

export default SuperadminOverview;
