'use client';

/**
 * User Profile Dropdown Component
 *
 * Displays user information and authentication actions
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function UserProfileDropdown() {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render if loading or no user
  if (isLoading || !user) {
    return null;
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (user.name) {
      return user.name;
    }
    if (user.given_name && user.family_name) {
      return `${user.given_name} ${user.family_name}`;
    }
    if (user.given_name) {
      return user.given_name;
    }
    return user.email;
  };

  // Get role badge color
  const getRoleBadgeColor = () => {
    const roles = user.roles || ['user'];
    if (roles.includes('superadmin')) {
      return 'bg-error-100 text-error-700';
    }
    if (roles.includes('admin')) {
      return 'bg-warning-100 text-warning-700';
    }
    return 'bg-primary-100 text-primary-700';
  };

  // Get role display text
  const getRoleText = () => {
    const roles = user.roles || ['user'];
    if (roles.includes('superadmin')) {
      return 'Super Admin';
    }
    if (roles.includes('admin')) {
      return 'Admin';
    }
    return 'User';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-sm font-semibold text-white shadow-sm">
          {user.picture ? (
            <img
              src={user.picture}
              alt={getDisplayName()}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitials()
          )}
        </div>

        {/* User Info (hidden on mobile) */}
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-slate-900">{getDisplayName()}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>

        {/* Chevron */}
        <svg
          className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-lg border border-slate-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {/* User Info Section */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-sm font-semibold text-white shadow-sm">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={getDisplayName()}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials()
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-900">{getDisplayName()}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor()}`}
                  >
                    {getRoleText()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Profile */}
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to profile page
                window.location.href = '/profile';
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>View Profile</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to settings page
                window.location.href = '/settings';
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </button>

            {/* Divider */}
            <div className="my-2 border-t border-slate-200"></div>

            {/* Logout */}
            <button
              onClick={async () => {
                setIsOpen(false);
                await logout();
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-error-600 transition-colors hover:bg-error-50"
            >
              <svg
                className="h-5 w-5 text-error-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
