'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Hero from './components/hero';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cyclist, setCyclist] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const [cyclistData, statsData, recsData] = await Promise.all([
          backend.cyclists.me(),
          backend.cyclists.stats(),
          backend.recommendations.list(),
        ]);

        setCyclist(cyclistData);
        setStats(statsData);
        setRecommendations(recsData);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!cyclist?.stravaId && (
          <Card className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Connectez votre compte Strava</h3>
                <p className="text-sm text-muted-foreground">
                  Importez vos activités pour obtenir des recommandations personnalisées
                </p>
              </div>
              <Button
                onClick={() => router.push('/strava/connect')}
                className="bg-[#FC4C02] hover:bg-[#E34402] text-white"
              >
                Connecter Strava
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distance totale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalDistance || 0} km</div>
              <p className="text-sm text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dénivelé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalElevation || 0} m</div>
              <p className="text-sm text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activityCount || 0}</div>
              <p className="text-sm text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>

        {recommendations?.recommendations?.[0] && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Votre pneu recommandé</CardTitle>
              <CardDescription>
                Basé sur votre profil de roulage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">
                    {recommendations.recommendations[0].tire.rangeName}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {recommendations.recommendations[0].explanation}
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-3xl font-bold text-primary">
                        {recommendations.recommendations[0].score}%
                      </div>
                      <div className="text-sm text-muted-foreground">Compatibilité</div>
                    </div>
                  </div>
                </div>
              </div>

              {recommendations.matchedAmbassador && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-2">Utilisé par</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium">{recommendations.matchedAmbassador.fullName}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {recommendations.matchedAmbassador.bio}
                    </p>
                    <p className="text-sm italic">
                      "{recommendations.matchedAmbassador.testimonial}"
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
