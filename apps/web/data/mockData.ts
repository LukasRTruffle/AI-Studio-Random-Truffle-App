/**
 * Mock Data for Development
 */

export interface Audience {
  id: string;
  name: string;
  size: number;
  status: 'active' | 'inactive' | 'processing';
  createdDate: string;
  lastUpdated: string;
  description?: string;
}

export const audienceData: Audience[] = [
  {
    id: 'aud-001',
    name: 'High-Value Customers',
    size: 15420,
    status: 'active',
    createdDate: '2025-10-20',
    lastUpdated: '2025-10-27',
    description: 'Customers with LTV > $1000 in last 90 days',
  },
  {
    id: 'aud-002',
    name: 'Cart Abandoners',
    size: 8750,
    status: 'active',
    createdDate: '2025-10-22',
    lastUpdated: '2025-10-26',
    description: 'Users who added to cart but didn&apos;t purchase',
  },
  {
    id: 'aud-003',
    name: 'Mobile App Users',
    size: 42300,
    status: 'active',
    createdDate: '2025-10-25',
    lastUpdated: '2025-10-27',
    description: 'Active mobile app users in last 30 days',
  },
  {
    id: 'aud-004',
    name: 'Newsletter Subscribers',
    size: 28900,
    status: 'processing',
    createdDate: '2025-10-26',
    lastUpdated: '2025-10-27',
    description: 'Email subscribers who opened last 3 campaigns',
  },
  {
    id: 'aud-005',
    name: 'Churned Users',
    size: 5230,
    status: 'inactive',
    createdDate: '2025-09-15',
    lastUpdated: '2025-10-10',
    description: 'Users inactive for 60+ days',
  },
];
