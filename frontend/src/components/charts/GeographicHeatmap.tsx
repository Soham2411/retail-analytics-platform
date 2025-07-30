// frontend/src/components/charts/GeographicHeatmap.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp, DollarSign, Users, Package } from 'lucide-react';

interface StateData {
  state: string;
  state_code: string;
  region: string;
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  avg_order_value: number;
  market_share: number;
}

interface GeographicHeatmapProps {
  data: StateData[];
  metric?: 'revenue' | 'orders' | 'customers' | 'aov';
  onStateClick?: (state: StateData) => void;
}

const US_STATES_SVG = {
  'CA': { x: 50, y: 200, width: 60, height: 40 },
  'NY': { x: 400, y: 80, width: 40, height: 30 },
  'TX': { x: 200, y: 250, width: 50, height: 40 },
  'FL': { x: 380, y: 280, width: 40, height: 30 },
  'WA': { x: 80, y: 50, width: 40, height: 30 },
  'OR': { x: 80, y: 85, width: 35, height: 25 },
  'NV': { x: 100, y: 130, width: 35, height: 40 },
  'VT': { x: 420, y: 60, width: 25, height: 20 },
  'ME': { x: 450, y: 50, width: 30, height: 35 },
  'NH': { x: 430, y: 75, width: 20, height: 25 },
  'GA': { x: 350, y: 230, width: 35, height: 40 },
  'AL': { x: 320, y: 240, width: 30, height: 35 },
  'SC': { x: 360, y: 210, width: 30, height: 25 },
  'VA': { x: 380, y: 160, width: 40, height: 25 },
  'NC': { x: 370, y: 185, width: 45, height: 25 },
  'MD': { x: 400, y: 145, width: 25, height: 15 },
  'DE': { x: 415, y: 155, width: 15, height: 20 },
  'OK': { x: 200, y: 210, width: 40, height: 25 },
  'KS': { x: 230, y: 180, width: 40, height: 25 },
  'NE': { x: 230, y: 150, width: 40, height: 25 }
};

export default function GeographicHeatmap({ data, metric = 'revenue', onStateClick }: GeographicHeatmapProps) {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Calculate min/max values for color scaling
  const { minValue, maxValue } = useMemo(() => {
    if (!data.length) return { minValue: 0, maxValue: 0 };
    
    const values = data.map(state => {
      switch (metric) {
        case 'revenue': return state.total_revenue;
        case 'orders': return state.total_orders;
        case 'customers': return state.unique_customers;
        case 'aov': return state.avg_order_value;
        default: return state.total_revenue;
      }
    });
    
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values)
    };
  }, [data, metric]);

  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  // Get state value based on metric
  const getStateValue = (state: StateData) => {
    switch (metric) {
      case 'revenue': return state.total_revenue;
      case 'orders': return state.total_orders;
      case 'customers': return state.unique_customers;
      case 'aov': return state.avg_order_value;
      default: return state.total_revenue;
    }
  };

  // Format value based on metric
  const formatValue = (value: number) => {
    switch (metric) {
      case 'revenue':
      case 'aov':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const handleStateClick = (state: StateData) => {
    setSelectedState(state);
    onStateClick?.(state);
  };

  const getMetricIcon = () => {
    switch (metric) {
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'orders': return <Package className="h-4 w-4" />;
      case 'customers': return <Users className="h-4 w-4" />;
      case 'aov': return <TrendingUp className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'revenue': return 'Revenue';
      case 'orders': return 'Orders';
      case 'customers': return 'Customers';
      case 'aov': return 'Avg Order Value';
      default: return 'Revenue';
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive US Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Heatmap - {getMetricLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Simple US Map Representation */}
            <svg viewBox="0 0 600 400" className="w-full h-96 border rounded-lg bg-gray-50">
              {/* Background */}
              <rect width="600" height="400" fill="#f8fafc" />
              
              {/* State rectangles */}
              {data.map((state) => {
                const coords = US_STATES_SVG[state.state_code as keyof typeof US_STATES_SVG];
                if (!coords) return null;
                
                const intensity = getColorIntensity(getStateValue(state));
                const baseColor = metric === 'revenue' ? '#10b981' : 
                                 metric === 'orders' ? '#3b82f6' :
                                 metric === 'customers' ? '#8b5cf6' : '#f59e0b';
                
                return (
                  <g key={state.state_code}>
                    <rect
                      x={coords.x}
                      y={coords.y}
                      width={coords.width}
                      height={coords.height}
                      fill={baseColor}
                      fillOpacity={0.3 + (intensity * 0.7)}
                      stroke="#374151"
                      strokeWidth={hoveredState === state.state_code ? 2 : 1}
                      className="cursor-pointer transition-all duration-200 hover:stroke-2"
                      onMouseEnter={() => setHoveredState(state.state_code)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => handleStateClick(state)}
                    />
                    <text
                      x={coords.x + coords.width / 2}
                      y={coords.y + coords.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-semibold fill-gray-800 pointer-events-none"
                    >
                      {state.state_code}
                    </text>
                  </g>
                );
              })}
              
              {/* Tooltip for hovered state */}
              {hoveredState && (() => {
                const state = data.find(s => s.state_code === hoveredState);
                const coords = US_STATES_SVG[hoveredState as keyof typeof US_STATES_SVG];
                if (!state || !coords) return null;
                
                return (
                  <g>
                    <rect
                      x={coords.x + coords.width + 10}
                      y={coords.y - 10}
                      width="120"
                      height="60"
                      fill="white"
                      stroke="#d1d5db"
                      strokeWidth="1"
                      rx="4"
                      className="drop-shadow-lg"
                    />
                    <text
                      x={coords.x + coords.width + 20}
                      y={coords.y + 5}
                      className="text-sm font-semibold fill-gray-900"
                    >
                      {state.state}
                    </text>
                    <text
                      x={coords.x + coords.width + 20}
                      y={coords.y + 20}
                      className="text-xs fill-gray-600"
                    >
                      {getMetricLabel()}: {formatValue(getStateValue(state))}
                    </text>
                    <text
                      x={coords.x + coords.width + 20}
                      y={coords.y + 35}
                      className="text-xs fill-gray-600"
                    >
                      Region: {state.region}
                    </text>
                  </g>
                );
              })()}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
              <div className="text-sm font-semibold mb-2 flex items-center gap-1">
                {getMetricIcon()}
                {getMetricLabel()} Scale
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Low</span>
                <div className="w-20 h-3 bg-gradient-to-r from-gray-200 to-green-600 rounded"></div>
                <span className="text-xs text-gray-600">High</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatValue(minValue)}</span>
                <span>{formatValue(maxValue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* State Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performing States
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data
                .sort((a, b) => getStateValue(b) - getStateValue(a))
                .slice(0, 5)
                .map((state, index) => (
                  <div
                    key={state.state_code}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleStateClick(state)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-semibold">{state.state}</div>
                        <div className="text-sm text-gray-600">{state.region}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatValue(getStateValue(state))}</div>
                      <div className="text-sm text-gray-600">{state.market_share}% share</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected State Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedState ? `${selectedState.state} Details` : 'State Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedState ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Revenue</div>
                    <div className="text-lg font-bold text-blue-900">
                      {formatValue(selectedState.total_revenue)}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Orders</div>
                    <div className="text-lg font-bold text-green-900">
                      {formatValue(selectedState.total_orders)}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Customers</div>
                    <div className="text-lg font-bold text-purple-900">
                      {formatValue(selectedState.unique_customers)}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">AOV</div>
                    <div className="text-lg font-bold text-orange-900">
                      {formatValue(selectedState.avg_order_value)}
                    </div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Market Share</span>
                    <Badge variant="outline">{selectedState.market_share}%</Badge>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">Region</span>
                    <Badge>{selectedState.region}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>Click on a state in the map to view detailed metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}