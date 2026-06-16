'use client';

import * as React from 'react';
import { useState } from 'react';

export interface ImageUploaderProps {
  mainPhotoUrl?: string;
  additionalPhotos?: string[];
  onMainPhotoChange: (url: string | undefined) => void;
  onAdditionalPhotosChange: (urls: string[]) => void;
}

export function ImageUploader({
  mainPhotoUrl,
  additionalPhotos = [],
  onMainPhotoChange,
  onAdditionalPhotosChange,
}: ImageUploaderProps) {
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const addAdditionalPhoto = () => {
    if (newPhotoUrl.trim()) {
      onAdditionalPhotosChange([...additionalPhotos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const removeAdditionalPhoto = (index: number) => {
    onAdditionalPhotosChange(additionalPhotos.filter((_, i) => i !== index));
  };

  const setAsMainPhoto = (url: string) => {
    onMainPhotoChange(url);
  };

  return (
    <div className="space-y-4">
      {/* Main photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo principale
        </label>
        <input
          type="url"
          value={mainPhotoUrl || ''}
          onChange={(e) => onMainPhotoChange(e.target.value || undefined)}
          placeholder="https://exemple.com/photo.jpg"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {mainPhotoUrl && (
          <div className="mt-2">
            <img
              src={mainPhotoUrl}
              alt="Photo principale"
              className="w-32 h-32 object-cover rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Additional photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos supplémentaires
        </label>

        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={newPhotoUrl}
            onChange={(e) => setNewPhotoUrl(e.target.value)}
            placeholder="https://exemple.com/photo.jpg"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addAdditionalPhoto();
              }
            }}
          />
          <button
            type="button"
            onClick={addAdditionalPhoto}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Ajouter
          </button>
        </div>

        {additionalPhotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {additionalPhotos.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-md border border-gray-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAsMainPhoto(url)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    title="Définir comme photo principale"
                  >
                    Principal
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAdditionalPhoto(index)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    title="Supprimer"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {additionalPhotos.length === 0 && (
          <div className="text-sm text-gray-500 italic">
            Aucune photo supplémentaire ajoutée.
          </div>
        )}
      </div>
    </div>
  );
}
