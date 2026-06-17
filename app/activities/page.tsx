'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ActivityMapModal from './components/ActivityMapModal';

type Period = 'all' | 'season' | 'month' | 'week';

const PERIODS: { value: Period; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'season', label: 'Saison' },
  { value: 'month', label: 'Mois' },
  { value: 'week', label: 'Semaine' },
];

const BIKE_TYPE_ICONS: Record<string, string> = {
  ROAD: '🚴',
  MTB: '🚵',
  GRAVEL: '🚴‍♂️',
  E_BIKE: '⚡',
};

export default function ActivitiesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cyclist, setCyclist] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const [cyclistData, activitiesData] = await Promise.all([
        backend.cyclists.me(),
        backend.activities.list(),
      ]);

      setCyclist(cyclistData);
      setActivities(activitiesData?.activities || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivitiesByPeriod = (period: Period) => {
    if (period === 'all') return activities;

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'season':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return activities;
    }

    return activities.filter(
      (activity) => new Date(activity.activityDate) >= startDate
    );
  };

  const filteredActivities = filterActivitiesByPeriod(selectedPeriod);

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!cyclist?.stravaId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connectez Strava</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous devez connecter votre compte Strava pour voir vos activités.
            </p>
            <Button
              onClick={() => router.push('/strava/connect')}
              className="w-full bg-[#FC4C02] hover:bg-[#E34402] text-white"
            >
              Connecter Strava
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Strava style */}
      <div className="bg-[#FC4C02] text-white px-5 py-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Mes Activités</h1>
          <p className="text-white/90 text-sm">
            {filteredActivities.length} sortie{filteredActivities.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtres de période - Strava style */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-2 flex-wrap">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`
                  px-4 py-2 rounded-md font-semibold text-sm transition-all
                  ${selectedPeriod === period.value
                    ? 'bg-[#FC4C02] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des activités - Strava style */}
        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
              Aucune activité pour cette période
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-200"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="flex">
                  {/* Miniature carte à gauche - Strava style */}
                  {activity.polyline ? (
                    <div className="w-24 sm:w-32 bg-gray-100 flex-shrink-0 relative">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 text-white text-4xl">
                        🗺️
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 sm:w-32 bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                  )}

                  {/* Contenu principal */}
                  <div className="flex-1 p-4">
                    {/* En-tête */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">
                            {BIKE_TYPE_ICONS[activity.bikeType] || '🚴'}
                          </span>
                          <h3 className="font-bold text-base text-gray-900">
                            {activity.bikeType === 'ROAD' ? 'Sortie Route' :
                             activity.bikeType === 'MTB' ? 'Sortie VTT' :
                             activity.bikeType === 'GRAVEL' ? 'Sortie Gravel' :
                             'Sortie Vélo'}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(activity.activityDate)}
                        </p>
                      </div>
                    </div>

                    {/* Stats - Strava style inline */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {activity.distance.toFixed(1)}
                        </span>
                        <span className="text-gray-500">km</span>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {Math.round(activity.elevationGain)}
                        </span>
                        <span className="text-gray-500">m</span>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatDuration(activity.movingTime)}
                        </span>
                      </div>

                      {activity.averageSpeed && (
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-semibold text-gray-700">
                            {activity.averageSpeed.toFixed(1)}
                          </span>
                          <span className="text-gray-500">km/h</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal avec carte */}
      {selectedActivity && (
        <ActivityMapModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}
