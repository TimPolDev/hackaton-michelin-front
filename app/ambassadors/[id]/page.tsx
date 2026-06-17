'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { backend } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { downloadGPX } from '@/lib/gpx-export';
import dynamic from 'next/dynamic';

const ActivityMapModal = dynamic(() => import('../../activities/components/ActivityMapModal'), {
  ssr: false,
});

const BIKE_TYPE_ICONS: Record<string, string> = {
  ROAD: '🚴',
  MTB: '🚵',
  GRAVEL: '🚴‍♂️',
};

export default function AmbassadorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ambassadorId = params.id as string;

  const [ambassador, setAmbassador] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  useEffect(() => {
    const loadAmbassador = async () => {
      try {
        const data = await backend.ambassadors.get(ambassadorId);
        setAmbassador(data);
      } catch (error) {
        console.error('Error loading ambassador:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAmbassador();
  }, [ambassadorId]);

  useEffect(() => {
    const loadActivities = async () => {
      setActivitiesLoading(true);
      try {
        const data = await backend.ambassadors.getActivities(ambassadorId, 6);
        if (data.hasStrava) {
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    if (ambassadorId) {
      loadActivities();
    }
  }, [ambassadorId]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    }
    return `${minutes}min`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!ambassador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ambassadeur introuvable</h2>
          <Button onClick={() => router.push('/ambassadors')}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.push('/ambassadors')}>
          ← Ambassadeurs
        </Button>
        {/* En-tête avec photo principale */}
        <Card className="mb-6 overflow-hidden">
          {ambassador.photoUrl && (
            <div className="w-full h-80 overflow-hidden">
              <img
                src={ambassador.photoUrl}
                alt={ambassador.cyclist.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-3xl">{ambassador.cyclist.fullName}</CardTitle>
            <CardDescription className="text-lg">
              {ambassador.discipline} - {ambassador.skillLevel}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-base leading-relaxed">{ambassador.bio}</p>

            {ambassador.stats && (
              <div className="bg-blue-50 p-4 rounded-md mt-6">
                <h3 className="font-semibold mb-3">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Distance mensuelle</span>
                    <p className="font-bold text-lg">{ambassador.stats.monthlyDistance} km</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Dénivelé total</span>
                    <p className="font-bold text-lg">{ambassador.stats.totalElevation} m</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Galerie photos */}
        {ambassador.photos && ambassador.photos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Galerie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ambassador.photos.map((photoUrl: string, index: number) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={photoUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Article */}
        {ambassador.articleContent && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>À propos</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: ambassador.articleContent }}
              />
            </CardContent>
          </Card>
        )}

        {/* Segments remarquables */}
        {ambassador.featuredSegments && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performances notables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{ambassador.featuredSegments}</p>
            </CardContent>
          </Card>
        )}

        {/* Itinéraires Strava */}
        {activities.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="bg-gradient-to-r from-[#FC4C02]/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🗺️</span>
                    Itinéraires
                  </CardTitle>
                  <CardDescription>
                    Les parcours Strava de {ambassador.cyclist.fullName}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/itineraires')}
                  className="border-[#FC4C02] text-[#FC4C02] hover:bg-[#FC4C02] hover:text-white"
                >
                  Voir tous
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border rounded-lg hover:shadow-md transition-all overflow-hidden relative group"
                  >
                    {/* Miniature carte avec gradient orange */}
                    <div
                      className="h-32 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-4xl cursor-pointer"
                      onClick={() => setSelectedActivity(activity)}
                    >
                      🗺️
                    </div>

                    {/* Bouton GPX flottant */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadGPX(activity, ambassador?.cyclist?.fullName);
                      }}
                      size="sm"
                      className="absolute top-2 right-2 bg-white text-[#FC4C02] hover:bg-[#FC4C02] hover:text-white border border-[#FC4C02] opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      GPX
                    </Button>

                    {/* Détails */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setSelectedActivity(activity)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {BIKE_TYPE_ICONS[activity.bikeType] || '🚴'}
                        </span>
                        <h4 className="font-bold text-sm">
                          {activity.bikeType === 'ROAD' ? 'Sortie Route' :
                           activity.bikeType === 'MTB' ? 'Sortie VTT' :
                           activity.bikeType === 'GRAVEL' ? 'Sortie Gravel' :
                           'Sortie Vélo'}
                        </h4>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="font-bold text-gray-900">{activity.distance.toFixed(1)}</span>
                          <span className="text-gray-500 text-xs ml-1">km</span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900">{Math.round(activity.elevationGain)}</span>
                          <span className="text-gray-500 text-xs ml-1">m</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">{formatDuration(activity.movingTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pneus recommandés */}
        {ambassador.tires && ambassador.tires.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pneus Michelin utilisés</CardTitle>
              <CardDescription>
                Les pneus que {ambassador.cyclist.fullName} utilise et recommande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ambassador.tires.map((tireInfo: any) => (
                  <div key={tireInfo.bikeType} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {tireInfo.bikeType}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{tireInfo.tire.rangeName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {tireInfo.tire.webProductName}
                        </p>
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-sm">
                          "{tireInfo.testimonial}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push('/ambassadors')}>
            ← Retour aux ambassadeurs
          </Button>
        </div>
      </div>

      {/* Modal carte */}
      {selectedActivity && (
        <ActivityMapModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          ambassadorName={ambassador?.cyclist?.fullName}
        />
      )}
    </div>
  );
}
