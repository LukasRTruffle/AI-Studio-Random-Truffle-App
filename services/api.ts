// This file will contain functions for making API calls to your backend.
// For example, using fetch or a library like axios.

import { Audience } from '../types';

const API_BASE_URL = '/api'; // Or your actual API base URL

// Example function
export const fetchAudiences = async (): Promise<Audience[]> => {
  const response = await fetch(`${API_BASE_URL}/audiences`);
  if (!response.ok) {
    throw new Error('Failed to fetch audiences');
  }
  return response.json();
};
