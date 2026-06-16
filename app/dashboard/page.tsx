'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

        const [cyclistRes, statsRes, recsRes] = await Promise.all([
          api.get('/cyclists/me'),
          api.get('/cyclists/me/stats'),
          api.get('/recommendations'),
        ]);

        setCyclist(cyclistRes.data);
        setStats(statsRes.data);
        setRecommendations(recsRes.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-primary">Michelin Bike</h1>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => router.push('/clubs')}>
                Clubs
              </Button>
              <Button variant="ghost" onClick={() => router.push('/ambassadors')}>
                Ambassadeurs
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Bonjour, {cyclist?.fullName || 'Cycliste'} !
          </h2>
          <p className="text-muted-foreground">
            Voici votre tableau de bord personnalisé
          </p>
        </div>

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
