// TODO: Migrate to Recharts (ADR-003) - Chart.js removed in Phase 0
// This file is temporarily disabled until Recharts migration is complete

import { ChartData } from '../types';

interface BarChartProps {
  data: ChartData;
  title?: string;
}

const BarChart: React.FC<BarChartProps> = ({ title = 'Chart' }) => {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center text-gray-500">
        <p className="font-medium">{title}</p>
        <p className="text-sm">Chart will be migrated to Recharts in Phase 0.3</p>
      </div>
    </div>
  );
};

export default BarChart;
