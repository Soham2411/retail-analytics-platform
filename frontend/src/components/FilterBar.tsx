import React, { useState, useEffect } from 'react';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';

export interface FilterState {
  startDate: string;
  endDate: string;
  categories: string[];
  regions: string[];
  customerSegments: string[];
}

interface FilterOptions {
  categories: string[];
  regions: string[];
  dateRange: {
    minDate: string;
    maxDate: string;
  };
  customerSegments: string[];
}

interface FilterComponentsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  isLoading?: boolean;
}

// Date Range Picker Component
export const DateRangePicker: React.FC<{
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  minDate?: string;
  maxDate?: string;
}> = ({ startDate, endDate, onChange, minDate, maxDate }) => {
  const [showPresets, setShowPresets] = useState(false);

  const presets = [
    {
      label: 'Last 7 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Last 30 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Last 90 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 90);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Current Year',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return {
          start: start.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        };
      }
    }
  ];

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          min={minDate}
          max={maxDate}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          min={startDate || minDate}
          max={maxDate}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 flex items-center"
        >
          Quick Select <ChevronDown className="ml-1 h-3 w-3" />
        </button>
      </div>

      {showPresets && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[200px]">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => {
                const { start, end } = preset.getValue();
                onChange(start, end);
                setShowPresets(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Multi-Select Dropdown Component
export const MultiSelectDropdown: React.FC<{
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}> = ({ label, options, selected, onChange, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter(item => item !== option));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div className="min-h-[42px] border border-gray-300 rounded-md p-2 bg-white cursor-pointer" 
           onClick={() => setIsOpen(!isOpen)}>
        {selected.length === 0 ? (
          <span className="text-gray-500 text-sm">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {selected.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                {item}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(item);
                  }}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
          ) : (
            options.map((option) => (
              <label
                key={option}
                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Main Filter Bar Component
export const FilterBar: React.FC<FilterComponentsProps> = ({
  filters,
  onFiltersChange,
  isLoading = false
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    regions: [],
    dateRange: { minDate: '', maxDate: '' },
    customerSegments: ['new', 'returning', 'high_value']
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Fetch filter options from API
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/filtered/filter-options');
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data);
        } else {
          console.error('Failed to fetch filter options:', response.status);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      startDate: '',
      endDate: '',
      categories: [],
      regions: [],
      customerSegments: []
    });
  };

  const hasActiveFilters = filters.startDate || filters.endDate || 
    filters.categories.length > 0 || filters.regions.length > 0 || 
    filters.customerSegments.length > 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-200 text-blue-800 rounded-full">
                Active
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all filters
            </button>
          )}

          {isLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Updating...
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {hasActiveFilters ? 'Filtered view' : 'All data'}
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date Range */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <DateRangePicker
                startDate={filters.startDate}
                endDate={filters.endDate}
                onChange={(start, end) => updateFilters({ startDate: start, endDate: end })}
                minDate={filterOptions.dateRange?.minDate || ''}
                maxDate={filterOptions.dateRange?.maxDate || ''}
              />
            </div>

            {/* Product Categories */}
            <div>
              <MultiSelectDropdown
                label="Product Categories"
                options={filterOptions.categories}
                selected={filters.categories}
                onChange={(categories) => updateFilters({ categories })}
                placeholder="All categories"
              />
            </div>

            {/* Regions */}
            <div>
              <MultiSelectDropdown
                label="Regions"
                options={filterOptions.regions}
                selected={filters.regions}
                onChange={(regions) => updateFilters({ regions })}
                placeholder="All regions"
              />
            </div>

            {/* Customer Segments */}
            <div className="md:col-span-2 lg:col-span-1">
              <MultiSelectDropdown
                label="Customer Segments"
                options={['new', 'returning', 'high_value']}
                selected={filters.customerSegments}
                onChange={(customerSegments) => updateFilters({ customerSegments })}
                placeholder="All customers"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};