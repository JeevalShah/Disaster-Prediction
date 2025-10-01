import React from 'react';
import { Calendar, Eye, BarChart3, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Photo {
  id: string;
  user_id: string;
  photo_url: string;
  ai_result: any;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
  };
}

interface PhotoGridProps {
  photos: Photo[];
  onPhotoDeleted: () => void;
}

export function PhotoGrid({ photos, onPhotoDeleted }: PhotoGridProps) {
  const { user, profile } = useAuth();

  const handleDelete = async (photo: Photo) => {
    if (!user) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this photo?');
    if (!confirmDelete) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) {
        throw dbError;
      }

      // Delete from storage
      const urlParts = photo.photo_url.split('/public/photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        const { error: storageError } = await supabase.storage
          .from('photos')
          .remove([filePath]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
        }
      }


      onPhotoDeleted();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  const handleAnalyzePhoto = (photo: Photo) => {
    // Redirect to Streamlit page for AI analysis
    const streamlitUrl = `https://disasterprediction.streamlit.app/`;
    window.open(streamlitUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canDelete = (photo: Photo) => {
    return profile?.role === 'admin' || photo.user_id === user?.id;
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Eye className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No photos</h3>
        <p className="mt-1 text-sm text-gray-500">
          {profile?.role === 'resident' 
            ? 'Upload your first photo to get started.'
            : 'No photos have been uploaded by residents yet.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {photos.map((photo) => (
        <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="w-full h-48 bg-gray-200">
            <img
              src={photo.photo_url}
              alt="Uploaded photo"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                console.error('Image failed to load:', photo.photo_url);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', photo.photo_url);
              }}
            />
          </div>
          
          <div className="p-4 space-y-3">
            {profile?.role === 'admin' && photo.profiles?.name && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">By: {photo.profiles.name}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(photo.created_at)}
            </div>

            {photo.ai_result && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center text-sm font-medium text-blue-800 mb-2">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  AI Analysis
                </div>
                <div className="text-xs text-blue-600">
                  {JSON.stringify(photo.ai_result, null, 2).substring(0, 100)}...
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {profile?.role === 'resident' && photo.user_id === user?.id && (
                <button
                  onClick={() => handleAnalyzePhoto(photo)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Analyze Photo
                </button>
              )}

              {canDelete(photo) && (
                <button
                  onClick={() => handleDelete(photo)}
                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}