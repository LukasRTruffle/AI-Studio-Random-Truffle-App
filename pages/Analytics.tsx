import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import KpiCard from '../components/ui/KpiCard';
// TODO: Migrate to Recharts (ADR-003) - Chart.js removed in Phase 0
// import BarChart from '../components/BarChart';
// import LineChart from '../components/LineChart';
import { kpiData } from '../data/mockData'; // barChartData, lineChartData
import Card from '../components/ui/Card';

const Analytics: React.FC = () => {
  return (
    <div className="p-6 md:p-10">
      <PageHeader title="Analytics Dashboard" subtitle="Overview of audience and activation performance."/>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* TODO: Restore charts with Recharts implementation (ADR-003) */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="h-80">
            <LineChart data={lineChartData} title="Audience Growth" />
          </div>
        </Card>
        <Card>
          <div className="h-80">
            <BarChart data={barChartData} title="Conversions by Channel" />
          </div>
        </Card>
      </div> */}
    </div>
  );
};

export default Analytics;
