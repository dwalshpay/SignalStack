import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common';
import { useAuthStore } from '@/store/useAuthStore';

interface HeaderProps {
  onSave?: () => void;
  onExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSave, onExport }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const organization = useAuthStore((state) => state.organization);
  const logout = useAuthStore((state) => state.logout);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCalculator = location.pathname === '/calculator' || location.pathname === '/';
  const isImplementation = location.pathname.startsWith('/implementation');
  const isValidation = location.pathname.startsWith('/validation');
  const isMonitoring = location.pathname.startsWith('/monitoring');
  const isSettings = location.pathname.startsWith('/settings');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
              <Link
                to="/monitoring"
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isMonitoring
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Monitoring
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

            {/* User Menu */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(user.name)}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      {organization && (
                        <p className="text-xs text-gray-400 mt-1">
                          {organization.name}
                        </p>
                      )}
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                        isSettings ? 'text-primary-600' : 'text-gray-700'
                      }`}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
