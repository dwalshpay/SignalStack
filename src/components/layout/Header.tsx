import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/common';

interface HeaderProps {
  onSave?: () => void;
  onExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSave, onExport }) => {
  const location = useLocation();
  const isCalculator = location.pathname === '/calculator' || location.pathname === '/';
  const isImplementation = location.pathname.startsWith('/implementation');
  const isValidation = location.pathname.startsWith('/validation');

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              SignalStack
            </h1>
            <nav className="ml-8 flex space-x-1">
              <Link
                to="/calculator"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isCalculator
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Value Calculator
              </Link>
              <Link
                to="/implementation"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isImplementation
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Implementation
              </Link>
              <Link
                to="/validation"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isValidation
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Validation
              </Link>
            </nav>
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
