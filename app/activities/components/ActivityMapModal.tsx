'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Import Leaflet dynamically to avoid SSR issues
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 rounded flex items-center justify-center">
      Chargement de la carte...
    </div>
  ),
});

interface Activity {
  id: string;
  bikeType: string;
  activityDate: string;
  distance: number;
  elevationGain: number;
  movingTime: number;
  averageSpeed?: number;
  polyline?: string;
  startLatitude?: number;
  startLongitude?: number;
}

interface ActivityMapModalProps {
  activity: Activity;
  onClose: () => void;
}

const BIKE_TYPE_LABELS: Record<string, string> = {
  ROAD: 'Route',
  MTB: 'VTT',
  GRAVEL: 'Gravel',
  E_BIKE: 'Vélo Électrique',
};

export default function ActivityMapModal({ activity, onClose }: ActivityMapModalProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return `${minutes}min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strava style */}
        <div className="bg-[#FC4C02] text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                Sortie {BIKE_TYPE_LABELS[activity.bikeType] || 'Vélo'}
              </h2>
              <p className="text-white/90 text-sm">
                {formatDate(activity.activityDate)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Statistiques - Strava style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-l-4 border-[#FC4C02] pl-4">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Distance</div>
              <div className="text-3xl font-bold text-gray-900">
                {activity.distance.toFixed(1)}
                <span className="text-lg text-gray-500 ml-1">km</span>
              </div>
            </div>

            <div className="border-l-4 border-[#FC4C02] pl-4">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Dénivelé</div>
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(activity.elevationGain)}
                <span className="text-lg text-gray-500 ml-1">m</span>
              </div>
            </div>

            <div className="border-l-4 border-[#FC4C02] pl-4">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Temps</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatDuration(activity.movingTime)}
              </div>
            </div>

            {activity.averageSpeed && (
              <div className="border-l-4 border-[#FC4C02] pl-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Vitesse moy.</div>
                <div className="text-3xl font-bold text-gray-900">
                  {activity.averageSpeed.toFixed(1)}
                  <span className="text-lg text-gray-500 ml-1">km/h</span>
                </div>
              </div>
            )}
          </div>

          {/* Carte - Strava style full width */}
          {activity.polyline ? (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900">Parcours</h3>
              <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                <MapView
                  polyline={activity.polyline}
                  startLatitude={activity.startLatitude}
                  startLongitude={activity.startLongitude}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 p-12 rounded-xl text-center">
              <div className="text-5xl mb-3">📍</div>
              <p className="text-gray-600 font-medium">
                Aucune trace GPS disponible pour cette activité
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
