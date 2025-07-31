'use client';

import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api'; // ✅ FIX: Correct case and remove KPIs import

// ✅ FIX: Define KPIs interface locally since it's not exported
interface KPIs {
  total_sales: number;
  total_customers: number;
  total_orders: number;
  avg_profit_margin: number;
  total_profit: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
}

function KPICard({ title, value, subtitle, icon }: KPICardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

export default function KPICards() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const data = await ApiClient.getKpis(); // ✅ FIX: Correct method name and ApiClient
        // Handle different response structures from your API
        const kpiData = data.kpis || data.data || data;
        setKpis(kpiData);
      } catch (err) {
        setError('Failed to load KPIs');
        console.error('Error fetching KPIs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse p-6 rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">⚠️ {error}</p>
      </div>
    );
  }

  if (!kpis) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <KPICard
        title="Total Sales"
        value={formatCurrency(kpis.total_sales)}
        subtitle="Revenue generated"
        icon="💰"
      />
      <KPICard
        title="Total Customers"
        value={formatNumber(kpis.total_customers)}
        subtitle="Unique customers"
        icon="👥"
      />
      <KPICard
        title="Total Orders"
        value={formatNumber(kpis.total_orders)}
        subtitle="Orders processed"
        icon="🛒"
      />
      <KPICard
        title="Profit Margin"
        value={`${kpis.avg_profit_margin.toFixed(1)}%`}
        subtitle="Average margin"
        icon="📊"
      />
      <KPICard
        title="Total Profit"
        value={formatCurrency(kpis.total_profit)}
        subtitle="Net profit"
        icon="💵"
      />
    </div>
  );
}