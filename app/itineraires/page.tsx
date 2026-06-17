'use client';

import { useEffect, useState } from 'react';
import { backend } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadGPX } from '@/lib/gpx-export';
import dynamic from 'next/dynamic';

const ActivityMapModal = dynamic(() => import('../activities/components/ActivityMapModal'), {
  ssr: false,
});

const BIKE_TYPES = [
  { value: '', label: 'Tous types' },
  { value: 'ROAD', label: '🚴 Route', icon: '🚴' },
  { value: 'MTB', label: '🚵 VTT', icon: '🚵' },
  { value: 'GRAVEL', label: '🚴‍♂️ Gravel', icon: '🚴‍♂️' },
];

const BIKE_TYPE_ICONS: Record<string, string> = {
  ROAD: '🚴',
  MTB: '🚵',
  GRAVEL: '🚴‍♂️',
};

export default function ItinerairesPage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [filters, setFilters] = useState({
    bikeType: '',
    minDistance: '',
    maxDistance: '',
    minElevation: '',
  });

  useEffect(() => {
    loadRoutes(true);
  }, []);

  // Auto-apply filters when they change
  useEffect(() => {
    // Skip initial load
    if (!initialLoading) {
      loadRoutes(false);
    }
  }, [filters.bikeType, filters.minDistance, filters.maxDistance, filters.minElevation]);

  const loadRoutes = async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      const params: any = {};

      if (filters.bikeType) params.bikeType = filters.bikeType;
      if (filters.minDistance) params.minDistance = Number(filters.minDistance);
      if (filters.maxDistance) params.maxDistance = Number(filters.maxDistance);
      if (filters.minElevation) params.minElevation = Number(filters.minElevation);

      const data = await backend.ambassadors.searchRoutes(params);
      setRoutes(data.routes || []);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

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
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Strava style */}
      <div className="bg-[#FC4C02] text-white px-5 py-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Itinéraires des Ambassadeurs</h1>
          <p className="text-white/90 text-sm">
            Découvrez les parcours des ambassadeurs Michelin
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtres */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type de vélo</label>
              <select
                value={filters.bikeType}
                onChange={(e) => handleFilterChange('bikeType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FC4C02] focus:border-transparent"
              >
                {BIKE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Distance min (km)</label>
              <input
                type="number"
                min="0"
                value={filters.minDistance}
                onChange={(e) => handleFilterChange('minDistance', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FC4C02] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Distance max (km)</label>
              <input
                type="number"
                min="0"
                value={filters.maxDistance}
                onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
                placeholder="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FC4C02] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dénivelé min (m)</label>
              <input
                type="number"
                min="0"
                value={filters.minElevation}
                onChange={(e) => handleFilterChange('minElevation', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#FC4C02] focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Liste des itinéraires */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {loading ? 'Recherche en cours...' : `${routes.length} itinéraire${routes.length > 1 ? 's' : ''} trouvé${routes.length > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="space-y-3 relative">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC4C02] mb-2"></div>
                <p className="text-sm font-medium text-gray-700">Mise à jour...</p>
              </div>
            </div>
          )}

          {routes.length === 0 ? (
            <Card className="p-12 text-center text-gray-500">
              Aucun itinéraire trouvé avec ces critères
            </Card>
          ) : (
            routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200"
              >
                <div className="flex">
                  {/* Miniature carte */}
                  <div
                    className="w-32 bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0 relative cursor-pointer"
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-white text-4xl">
                      🗺️
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedRoute(route)}
                      >
                        {/* Ambassadeur */}
                        <div className="flex items-center gap-3 mb-3">
                          {route.ambassador.photoUrl ? (
                            <img
                              src={route.ambassador.photoUrl}
                              alt={route.ambassador.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#FC4C02] flex items-center justify-center text-white font-bold">
                              {route.ambassador.name?.[0] || 'A'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900">{route.ambassador.name}</p>
                            <p className="text-xs text-gray-500">{route.ambassador.discipline}</p>
                          </div>
                        </div>

                        {/* Type et date */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">
                            {BIKE_TYPE_ICONS[route.bikeType] || '🚴'}
                          </span>
                          <h3 className="font-semibold text-gray-900">
                            {route.bikeType === 'ROAD' ? 'Sortie Route' :
                             route.bikeType === 'MTB' ? 'Sortie VTT' :
                             route.bikeType === 'GRAVEL' ? 'Sortie Gravel' :
                             'Sortie Vélo'}
                          </h3>
                          <span className="text-sm text-gray-500">• {formatDate(route.activityDate)}</span>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">
                              {route.distance.toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-sm">km</span>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">
                              {Math.round(route.elevationGain)}
                            </span>
                            <span className="text-gray-500 text-sm">m</span>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">
                              {formatDuration(route.movingTime)}
                            </span>
                          </div>

                          {route.averageSpeed && (
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-semibold text-gray-700">
                                {route.averageSpeed.toFixed(1)}
                              </span>
                              <span className="text-gray-500 text-sm">km/h</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bouton GPX */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadGPX(route, route.ambassador?.name);
                        }}
                        variant="outline"
                        size="sm"
                        className="border-[#FC4C02] text-[#FC4C02] hover:bg-[#FC4C02] hover:text-white shrink-0"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        GPX
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedRoute && (
        <ActivityMapModal
          activity={selectedRoute}
          onClose={() => setSelectedRoute(null)}
          ambassadorName={selectedRoute.ambassador?.name}
        />
      )}
    </div>
  );
}
