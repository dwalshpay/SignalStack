import React from 'react';
import { Button } from '@/components/common';

interface HeaderProps {
  onSave?: () => void;
  onExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSave, onExport }) => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              SignalStack
            </h1>
            <span className="ml-3 px-2 py-1 text-xs font-medium text-primary-600 bg-primary-100 rounded">
              Phase 1
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {onSave && (
              <Button variant="outline" size="sm" onClick={onSave}>
                Save
              </Button>
            )}
            {onExport && (
              <Button variant="primary" size="sm" onClick={onExport}>
                Export
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
