// Create: frontend/src/components/ui/select.tsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

let selectState: {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
} | null = null;

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  selectState = { value, onValueChange, isOpen, setIsOpen };
  
  return (
    <div className="relative">
      {children}
    </div>
  );
}

export function SelectTrigger({ children, className = '' }: SelectTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => selectState?.setIsOpen(!selectState.isOpen)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span>{selectState?.value || placeholder}</span>;
}

export function SelectContent({ children }: SelectContentProps) {
  if (!selectState?.isOpen) return null;
  
  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
      <div className="p-1">
        {children}
      </div>
    </div>
  );
}

export function SelectItem({ value, children }: SelectItemProps) {
  const handleClick = () => {
    selectState?.onValueChange(value);
    selectState?.setIsOpen(false);
  };

  return (
    <div 
      onClick={handleClick}
      className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-gray-100"
    >
      {children}
    </div>
  );
}