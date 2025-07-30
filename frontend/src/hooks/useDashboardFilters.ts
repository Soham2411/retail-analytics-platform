import { useState, useEffect, useCallback, useMemo } from 'react';

export interface FilterState {
  startDate: string;
  endDate: string;
  categories: string[];
  regions: string[];
  customerSegments: string[];
}

export interface DashboardData {
  kpis: {
    total_sales: number;
    total_orders: number;
    unique_customers: number;
    profit_margin: number;
  };
  salesTrends: Array<{
    month: string;
    sales: number;
  }>;
  regionalPerformance: Array<{
    region: string;
    sales: number;
    orders: number;
  }>;
  topProducts: Array<{
    product_name: string;
    category: string;
    total_quantity: number;
    total_sales: number;
  }>;
}

const initialFilters: FilterState = {
  startDate: '',
  endDate: '',
  categories: [],
  regions: [],
  customerSegments: []
};

export const useDashboardFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const buildApiQuery = useCallback((filters: FilterState): string => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.categories.length > 0) params.append('categories', filters.categories.join(','));
    if (filters.regions.length > 0) params.append('regions', filters.regions.join(','));
    if (filters.customerSegments.length > 0) params.append('customer_segments', filters.customerSegments.join(','));
    
    return params.toString();
  }, []);

 const fetchDashboardData = async () => {
  setIsLoading(true);
  setError(null);
  
  try {
    const queryString = buildApiQuery(filters);
    console.log('Fetching with query:', queryString); // Debug log
    
    // Test each endpoint individually
    console.log('Fetching KPIs...');
    const kpisRes = await fetch(`http://localhost:8000/api/filtered/kpis?${queryString}`);
    console.log('KPIs response:', kpisRes.status, kpisRes.ok);
    
    console.log('Fetching trends...');
    const trendsRes = await fetch(`http://localhost:8000/api/filtered/sales-trends?${queryString}`);
    console.log('Trends response:', trendsRes.status, trendsRes.ok);
    
    console.log('Fetching regional...');
    const regionalRes = await fetch(`http://localhost:8000/api/filtered/regional-performance?${queryString}`);
    console.log('Regional response:', regionalRes.status, regionalRes.ok);
    
    console.log('Fetching products...');
    const productsRes = await fetch(`http://localhost:8000/api/filtered/top-products?${queryString}&limit=5`);
    console.log('Products response:', productsRes.status, productsRes.ok);

    // Check for errors
    if (!kpisRes.ok) {
      const errorText = await kpisRes.text();
      console.error('KPIs error:', errorText);
      throw new Error(`KPIs fetch failed: ${kpisRes.status}`);
    }
    if (!trendsRes.ok) {
      const errorText = await trendsRes.text();
      console.error('Trends error:', errorText);
      throw new Error(`Trends fetch failed: ${trendsRes.status}`);
    }
    if (!regionalRes.ok) {
      const errorText = await regionalRes.text();
      console.error('Regional error:', errorText);
      throw new Error(`Regional fetch failed: ${regionalRes.status}`);
    }
    if (!productsRes.ok) {
      const errorText = await productsRes.text();
      console.error('Products error:', errorText);
      throw new Error(`Products fetch failed: ${productsRes.status}`);
    }

    // Parse responses
    const [kpis, salesTrends, regionalPerformance, topProducts] = await Promise.all([
      kpisRes.json(),
      trendsRes.json(),
      regionalRes.json(),
      productsRes.json()
    ]);

    console.log('All data fetched successfully:', { kpis, salesTrends, regionalPerformance, topProducts });

    setData({
      kpis,
      salesTrends,
      regionalPerformance,
      topProducts
    });
  } catch (err) {
    console.error('Fetch error:', err);
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setIsLoading(false);
  }
};

  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Apply quick date presets
  const applyDatePreset = useCallback((preset: string) => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    switch (preset) {
      case 'last_7_days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        startDate = sevenDaysAgo.toISOString().split('T')[0];
        break;
      case 'last_30_days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        break;
      case 'last_90_days':
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        startDate = ninetyDaysAgo.toISOString().split('T')[0];
        break;
      case 'current_year':
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      case 'last_year':
        startDate = new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        endDate = new Date(today.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }));
  }, []);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.startDate ||
      filters.endDate ||
      filters.categories.length > 0 ||
      filters.regions.length > 0 ||
      filters.customerSegments.length > 0
    );
  }, [filters]);

  // Get filter summary for display
  const filterSummary = useMemo(() => {
    const summary: string[] = [];
    
    if (filters.startDate && filters.endDate) {
      summary.push(`${filters.startDate} to ${filters.endDate}`);
    } else if (filters.startDate) {
      summary.push(`From ${filters.startDate}`);
    } else if (filters.endDate) {
      summary.push(`Until ${filters.endDate}`);
    }
    
    if (filters.categories.length > 0) {
      summary.push(`${filters.categories.length} categor${filters.categories.length === 1 ? 'y' : 'ies'}`);
    }
    
    if (filters.regions.length > 0) {
      summary.push(`${filters.regions.length} region${filters.regions.length === 1 ? '' : 's'}`);
    }
    
    if (filters.customerSegments.length > 0) {
      summary.push(`${filters.customerSegments.length} customer segment${filters.customerSegments.length === 1 ? '' : 's'}`);
    }
    
    return summary.join(' • ');
  }, [filters]);

  // Refresh data manually
  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [filters]);

  return {
    filters,
    data,
    isLoading,
    error,
    hasActiveFilters,
    filterSummary,
    updateFilters,
    clearFilters,
    applyDatePreset,
    refreshData
  };
};