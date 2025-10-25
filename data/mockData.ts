import { KpiData, Audience, ChartData } from '../types';

export const kpiData: KpiData[] = [
  { title: 'Total Audiences', value: '1,234', change: 12.5, changeType: 'increase' },
  { title: 'Total Reach', value: '5.6M', change: 5.2, changeType: 'increase' },
  { title: 'Activations', value: '56', change: 2.1, changeType: 'decrease' },
  { title: 'Conversion Rate', value: '3.4%', change: 0.8, changeType: 'increase' },
];

export const audienceData: Audience[] = [
  { id: '1', name: 'High-Value Customers', size: 15000, status: 'active', createdDate: '2023-01-15', lastUpdated: '2023-05-20' },
  { id: '2', name: 'Recent Shoppers', size: 75000, status: 'active', createdDate: '2023-02-10', lastUpdated: '2023-05-22' },
  { id: '3', name: 'Cart Abandoners (Last 7 Days)', size: 22000, status: 'inactive', createdDate: '2023-03-05', lastUpdated: '2023-05-18' },
  { id: '4', name: 'Q2 Promo Prospects', size: 120000, status: 'draft', createdDate: '2023-04-01', lastUpdated: '2023-05-21' },
];

export const lineChartData: ChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Audience Size',
        data: [65000, 59000, 80000, 81000, 56000, 55000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
};

export const barChartData: ChartData = {
    labels: ['Email', 'Social', 'Search', 'Display', 'Referral'],
    datasets: [
        {
            label: '# of Conversions',
            data: [120, 190, 300, 50, 20],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
    ],
};
