import React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div className={`p-4 rounded-lg border border-blue-200 bg-blue-50 ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '' }: AlertProps) {
  return (
    <div className={`text-sm text-blue-800 ${className}`}>
      {children}
    </div>
  );
}