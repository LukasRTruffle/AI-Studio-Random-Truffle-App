export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
}

export interface KpiData {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
}

export interface Audience {
  id: string;
  name: string;
  size: number;
  status: 'active' | 'inactive' | 'draft';
  createdDate: string;
  lastUpdated: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}
