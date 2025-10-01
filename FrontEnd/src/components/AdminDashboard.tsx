import React, { useState, useEffect } from 'react';
import { Users, Camera, BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PhotoGrid } from './PhotoGrid';

interface Photo {
  id: string;
  user_id: string;
  photo_url: string;
  ai_result: any;
  created_at: string;
  updated_at: string;
  profiles: {
    name: string;
  };
}

export function AdminDashboard() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResidents, setTotalResidents] = useState(0);

  const fetchData = async () => {
    try {
      // Fetch all photos with user profiles
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select(`
          *,
          profiles:user_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (photosError) {
        throw photosError;
      }

      setPhotos(photosData || []);

      // Fetch resident count
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'resident');

      if (countError) {
        throw countError;
      }

      setTotalResidents(count || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    totalPhotos: photos.length,
    analyzedPhotos: photos.filter(p => p.ai_result).length,
    pendingPhotos: photos.filter(p => !p.ai_result).length,
    totalResidents,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community Overview</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage community disaster reports
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.totalResidents}</h3>
              <p className="text-sm text-gray-500">Active Residents</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Camera className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.totalPhotos}</h3>
              <p className="text-sm text-gray-500">Total Photos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.analyzedPhotos}</h3>
              <p className="text-sm text-gray-500">AI Analyzed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.pendingPhotos}</h3>
              <p className="text-sm text-gray-500">Pending Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      {stats.analyzedPhotos > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Summary</h2>
          <div className="text-sm text-gray-600">
            <p>
              {((stats.analyzedPhotos / stats.totalPhotos) * 100).toFixed(1)}% of photos have been processed by AI analysis
            </p>
            {stats.pendingPhotos > 0 && (
              <p className="mt-2 text-orange-600">
                {stats.pendingPhotos} photos are awaiting analysis
              </p>
            )}
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Photos</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <PhotoGrid photos={photos} onPhotoDeleted={fetchData} />
        </div>
      </div>
    </div>
  );
}