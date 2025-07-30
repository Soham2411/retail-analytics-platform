// lib/api.ts - Centralized API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Response Types
export interface RegionData {
  region: string;
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  avg_order_value: number;
  market_share: number;
  revenue_per_customer: number;
}

export interface StateData {
  state: string;
  state_code: string;
  region: string;
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  avg_order_value: number;
  market_share: number;
}

export interface TrendData {
  region: string;
  month: string;
  monthly_revenue: number;
  monthly_orders: number;
  monthly_customers: number;
  revenue_growth?: number;
  order_growth?: number;
}

export interface GeographicApiResponse {
  regions: RegionData[];
  summary: {
    total_regions: number;
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    top_region: {
      name: string;
      revenue: number;
      market_share: number;
    };
  };
}

export interface StatesApiResponse {
  states: StateData[];
  summary: any;
}

export interface TrendsApiResponse {
  trends: TrendData[];
  regions: string[];
}

export interface ExecutiveSummary {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  executive_summary: string;
  key_insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  performance_metrics: {
    total_revenue: number;
    total_orders: number;
    unique_customers: number;
    avg_order_value: number;
    regional_breakdown: Array<{
      region: string;
      revenue: number;
    }>;
    category_breakdown: Array<{
      category: string;
      revenue: number;
      units: number;
    }>;
  };
  growth_metrics: {
    total_revenue: {
      current: number;
      previous: number;
      growth_rate: number;
      growth_direction: 'up' | 'down' | 'flat';
    };
    total_orders: {
      current: number;
      previous: number;
      growth_rate: number;
      growth_direction: 'up' | 'down' | 'flat';
    };
    unique_customers: {
      current: number;
      previous: number;
      growth_rate: number;
      growth_direction: 'up' | 'down' | 'flat';
    };
    avg_order_value: {
      current: number;
      previous: number;
      growth_rate: number;
      growth_direction: 'up' | 'down' | 'flat';
    };
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    actions: string[];
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    type: string;
    title: string;
    message: string;
    action_required: boolean;
  }>;
  generated_at: string;
}

export interface ForecastData {
  historical_data: Array<{
    date: string;
    actual_revenue: number;
    orders?: number;
  }>;
  forecast: Array<{
    date: string;
    forecasted_revenue: number;
    lower_bound: number;
    upper_bound: number;
    method: string;
  }>;
  accuracy_metrics: {
    mean_absolute_error: number;
    mean_absolute_percentage_error: number;
    r_squared: number;
  };
  model_info: {
    forecast_periods: number;
    methods_used: string[];
    data_points: number;
    forecast_period: string;
  };
  generated_at: string;
}

export class ApiClient {
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      await this.makeRequest('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Geographic Analytics
  static async getGeographicRegions(params?: {
    start_date?: string;
    end_date?: string;
    category?: string;
  }): Promise<GeographicApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.category) searchParams.set('category', params.category);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/analytics/geographic/regions${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<GeographicApiResponse>(endpoint);
  }

  static async getGeographicStates(params?: {
    start_date?: string;
    end_date?: string;
    category?: string;
  }): Promise<StatesApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.category) searchParams.set('category', params.category);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/analytics/geographic/states${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<StatesApiResponse>(endpoint);
  }

  static async getGeographicTrends(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<TrendsApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/analytics/geographic/trends${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<TrendsApiResponse>(endpoint);
  }

  // Executive Summary
  static async getExecutiveSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ExecutiveSummary> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/analytics/executive-summary${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ExecutiveSummary>(endpoint);
  }

  // Forecasting
  static async getSalesForecast(params?: {
    forecast_periods?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<ForecastData> {
    const searchParams = new URLSearchParams();
    if (params?.forecast_periods) searchParams.set('forecast_periods', params.forecast_periods.toString());
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    
    const queryString = searchParams.toString();
    const endpoint = `/api/analytics/forecast/sales${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ForecastData>(endpoint);
  }

  // Customer Analytics
  static async getRfmAnalysis(params?: {
    start_date?: string;
    end_date?: string;
    regions?: string;
    segments?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.regions) searchParams.set('regions', params.regions);
    if (params?.segments) searchParams.set('segments', params.segments);
    
    const queryString = searchParams.toString();
    const endpoint = `/customer-analytics/rfm${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<any>(endpoint);
  }

  static async getCustomerLifetimeValue(params?: {
    start_date?: string;
    end_date?: string;
    regions?: string;
    segments?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.regions) searchParams.set('regions', params.regions);
    if (params?.segments) searchParams.set('segments', params.segments);
    
    const queryString = searchParams.toString();
    const endpoint = `/customer-analytics/clv${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<any>(endpoint);
  }

  // Product Analytics
  static async getAbcAnalysis(params?: {
    start_date?: string;
    end_date?: string;
    categories?: string;
    regions?: string;
    customer_segments?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.categories) searchParams.set('categories', params.categories);
    if (params?.regions) searchParams.set('regions', params.regions);
    if (params?.customer_segments) searchParams.set('customer_segments', params.customer_segments);
    
    const queryString = searchParams.toString();
    const endpoint = `/product-analytics/abc-analysis${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<any>(endpoint);
  }

  static async getProfitabilityMatrix(params?: {
    start_date?: string;
    end_date?: string;
    categories?: string;
    regions?: string;
    customer_segments?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.categories) searchParams.set('categories', params.categories);
    if (params?.regions) searchParams.set('regions', params.regions);
    if (params?.customer_segments) searchParams.set('customer_segments', params.customer_segments);
    
    const queryString = searchParams.toString();
    const endpoint = `/product-analytics/profitability-matrix${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<any>(endpoint);
  }

  // Dashboard Analytics
  static async getKpis(params?: {
    start_date?: string;
    end_date?: string;
    categories?: string;
    regions?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.categories) searchParams.set('categories', params.categories);
    if (params?.regions) searchParams.set('regions', params.regions);
    
    const queryString = searchParams.toString();
    const endpoint = `/kpis${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<any>(endpoint);
  }

  static async getSalesTrends(params?: {
    start_date?: string;
    end_date?: string;
    categories?: string;
    regions?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.categories) searchParams.set('categories', params.categories);
    if (params?.regions) searchParams.set('regions', params.regions);
    
    const queryString = searchParams.toString();
    const endpoint = `/sales-trends${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<any>(endpoint);
  }
}