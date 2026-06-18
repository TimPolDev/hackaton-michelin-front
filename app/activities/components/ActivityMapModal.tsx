'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadGPX } from '@/lib/gpx-export';
import dynamic from 'next/dynamic';

// Import Leaflet dynamically to avoid SSR issues
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] sm:h-[320px] md:h-[400px] bg-gray-200 flex items-center justify-center">
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
  ambassadorName?: string;
}

const BIKE_TYPE_LABELS: Record<string, string> = {
  ROAD: 'Route',
  MTB: 'VTT',
  GRAVEL: 'Gravel',
  E_BIKE: 'Vélo Électrique',
};

export default function ActivityMapModal({ activity, onClose, ambassadorName }: ActivityMapModalProps) {
  const handleDownloadGPX = () => {
    downloadGPX(activity, ambassadorName);
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      {/* ─── BOTTOM SHEET (mobile) / MODALE CENTRÉE (desktop) ─── */}
      <div
        className="
          w-full max-w-full sm:max-w-4xl
          max-h-[90dvh] sm:max-h-[95vh]
          flex flex-col
          bg-white
          rounded-t-2xl sm:rounded-xl
          shadow-2xl overflow-hidden
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — visible uniquement sur mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* ── MOBILE : carte d'abord ── / ── DESKTOP : header d'abord ── */}

        {/* Header desktop uniquement */}
        <div className="hidden sm:block bg-[#27509B] text-white px-6 py-5 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-1">
                Sortie {BIKE_TYPE_LABELS[activity.bikeType] || 'Vélo'}
              </h2>
              <p className="text-white/80 text-sm">{formatDate(activity.activityDate)}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors shrink-0"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carte — en premier sur mobile pour voir la trace immédiatement */}
        {activity.polyline ? (
          <div className="sm:hidden shrink-0 h-52 overflow-hidden border-b border-gray-200">
            <MapView
              polyline={activity.polyline}
              startLatitude={activity.startLatitude}
              startLongitude={activity.startLongitude}
            />
          </div>
        ) : (
          <div className="sm:hidden shrink-0 h-28 bg-gray-100 flex flex-col items-center justify-center gap-2 border-b border-gray-200">
            <span className="text-3xl">📍</span>
            <p className="text-xs text-gray-500">Aucune trace GPS</p>
          </div>
        )}

        {/* Zone scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {/* Titre + date — visible uniquement sur mobile, sous la carte */}
          <div className="sm:hidden flex items-start justify-between gap-3 px-4 pt-4 pb-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Sortie {BIKE_TYPE_LABELS[activity.bikeType] || 'Vélo'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{formatDateShort(activity.activityDate)}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="text-gray-400 hover:text-gray-700 rounded-full p-1.5 hover:bg-gray-100 transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="px-4 sm:px-6 py-3 sm:py-5">
            {/* Mobile : grille 2×2 lisible avec icônes */}
            <div className="sm:hidden grid grid-cols-2 gap-2">
              {[
                { label: 'Distance', value: activity.distance.toFixed(1), unit: 'km' },
                { label: 'Dénivelé', value: String(Math.round(activity.elevationGain)), unit: 'm' },
                { label: 'Temps', value: formatDuration(activity.movingTime), unit: '' },
                ...(activity.averageSpeed
                  ? [{ label: 'Vitesse moy.', value: activity.averageSpeed.toFixed(1), unit: 'km/h' }]
                  : []),
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 border-l-4 border-l-[#27509B]"
                >
                  <div className="text-[10px] text-gray-500 uppercase font-semibold tracking-wide mb-0.5">
                    {s.label}
                  </div>
                  <div className="text-xl font-bold text-gray-900 leading-tight tabular-nums">
                    {s.value}
                    {s.unit && <span className="text-xs text-gray-500 font-medium ml-1">{s.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop : grille avec bordure gauche bleue */}
            <div className="hidden sm:grid grid-cols-4 gap-4">
              <div className="border-l-4 border-[#27509B] pl-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Distance</div>
                <div className="text-3xl font-bold text-gray-900">
                  {activity.distance.toFixed(1)}<span className="text-lg text-gray-500 ml-1">km</span>
                </div>
              </div>
              <div className="border-l-4 border-[#27509B] pl-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Dénivelé</div>
                <div className="text-3xl font-bold text-gray-900">
                  {Math.round(activity.elevationGain)}<span className="text-lg text-gray-500 ml-1">m</span>
                </div>
              </div>
              <div className="border-l-4 border-[#27509B] pl-4">
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Temps</div>
                <div className="text-3xl font-bold text-gray-900">{formatDuration(activity.movingTime)}</div>
              </div>
              {activity.averageSpeed && (
                <div className="border-l-4 border-[#27509B] pl-4">
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Vitesse moy.</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {activity.averageSpeed.toFixed(1)}<span className="text-lg text-gray-500 ml-1">km/h</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Carte desktop (après les stats) */}
          {activity.polyline ? (
            <div className="hidden sm:block px-6 pb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Parcours</h3>
                <Button
                  onClick={handleDownloadGPX}
                  variant="outline"
                  className="border-[#27509B] text-[#27509B] hover:bg-[#27509B] hover:text-white"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Télécharger GPX
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                <MapView
                  polyline={activity.polyline}
                  startLatitude={activity.startLatitude}
                  startLongitude={activity.startLongitude}
                />
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex bg-gray-100 mx-6 mb-6 p-10 rounded-xl flex-col items-center gap-3">
              <span className="text-5xl">📍</span>
              <p className="text-gray-600 font-medium">Aucune trace GPS disponible</p>
            </div>
          )}
        </div>

        {/* Bouton GPX fixe en bas — mobile uniquement */}
        {activity.polyline && (
          <div className="sm:hidden shrink-0 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-gray-100 bg-white">
            <Button
              onClick={handleDownloadGPX}
              className="w-full bg-[#27509B] hover:bg-[#1e3f7a] text-white font-semibold"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger GPX
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
