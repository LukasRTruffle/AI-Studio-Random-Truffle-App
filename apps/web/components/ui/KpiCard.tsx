import React from 'react';
import Icon from '../Icon';

interface KpiData {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
}

const KpiCard: React.FC<KpiData> = ({ title, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-green-500' : 'text-red-500';
  const iconName = isIncrease ? 'arrow_upward' : 'arrow_downward';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-semibold">{value}</p>
        <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeColor}`}>
          <Icon
            name={iconName}
            className="self-center flex-shrink-0"
            style={{ fontSize: '18px' }}
          />
          <span className="sr-only">{isIncrease ? 'Increased' : 'Decreased'} by</span>
          {change}%
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
