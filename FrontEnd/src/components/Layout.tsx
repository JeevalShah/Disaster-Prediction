import React from 'react';
import { Shield, LogOut, Camera, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-red-600" />
                <span className="text-xl font-bold text-gray-900">
                  Disaster Management
                </span>
              </div>
              {profile && (
                <div className="flex items-center space-x-2 ml-8">
                  {profile.role === 'admin' ? (
                    <Users className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Camera className="h-5 w-5 text-green-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {profile.role}
                  </span>
                </div>
              )}
            </div>
            
            {profile && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {profile.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}