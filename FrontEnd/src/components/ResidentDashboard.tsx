import React, { useState, useEffect } from 'react';
import { Camera, Upload, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PhotoUpload } from './PhotoUpload';
import { PhotoGrid } from './PhotoGrid';

interface Photo {
  id: string;
  user_id: string;
  photo_url: string;
  ai_result: any;
  created_at: string;
  updated_at: string;
}

export function ResidentDashboard() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const { user } = useAuth();

  const fetchPhotos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchPhotos();
  };

  const stats = {
    totalPhotos: photos.length,
    analyzedPhotos: photos.filter(p => p.ai_result).length,
    pendingPhotos: photos.filter(p => !p.ai_result).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Photos</h1>
        <p className="mt-2 text-gray-600">
          Upload and manage your disaster-related photos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.analyzedPhotos}</h3>
              <p className="text-sm text-gray-500">Analyzed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Upload className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.pendingPhotos}</h3>
              <p className="text-sm text-gray-500">Pending Analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload New Photo</h2>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            {showUpload ? 'Hide Upload' : 'Upload Photo'}
          </button>
        </div>

        {showUpload && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <PhotoUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}
      </div>

      {/* Photos Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Photos</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <PhotoGrid photos={photos} onPhotoDeleted={fetchPhotos} />
        </div>
      </div>
    </div>
  );
}