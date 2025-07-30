'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiClient, RegionalPerformance } from '@/lib/api';

export default function RegionalChart() {
  const [regions, setRegions] = useState<RegionalPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRegions() {
      try {
        const data = await apiClient.getRegionalPerformance();
        setRegions(data);
      } catch (err) {
        console.error('Error fetching regional data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRegions();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ Regional Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={regions}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="region" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip 
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === 'sales' ? 'Sales' : 'Profit'
            ]}
          />
          <Legend />
          <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
          <Bar dataKey="profit" fill="#10b981" name="Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}