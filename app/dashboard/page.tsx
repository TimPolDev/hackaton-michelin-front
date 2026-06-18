'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Hero from './components/hero';

type Period = 'all' | 'season' | 'month' | 'week';

const PERIODS: { value: Period; label: string; description: string }[] = [
  { value: 'all', label: 'Total', description: 'Depuis le début' },
  { value: 'season', label: 'Saison', description: 'Cette année' },
  { value: 'month', label: 'Mois', description: 'Ce mois-ci' },
  { value: 'week', label: 'Semaine', description: 'Cette semaine' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [cyclist, setCyclist] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
<<<<<<< Updated upstream
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');
  const [syncing, setSyncing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
=======
  const [isAdmin, setIsAdmin] = useState(false);
>>>>>>> Stashed changes

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

<<<<<<< Updated upstream
        // Load cyclist and stats first (critical)
        const [cyclistData, statsData] = await Promise.all([
          backend.cyclists.me(),
          backend.cyclists.stats({ period: 'all' }), // Par défaut: toutes les données
        ]);

        console.log('Cyclist data:', cyclistData);
        console.log('Stats data:', statsData);

        setCyclist(cyclistData);

        // Always set stats, even if it's an empty object
        if (statsData) {
          setStats(statsData);
        } else {
          // Set default empty stats if API returns null/undefined
          setStats({
            totalDistance: 0,
            totalElevation: 0,
            activityCount: 0,
            averageSpeed: 0,
            terrainDistribution: { asphalt: 0, offroad: 0, mixed: 0 }
          });
        }

        setInitialLoadComplete(true);

        // Load recommendations separately (non-blocking)
        try {
          const recsData = await backend.recommendations.list();
          console.log('Recommendations:', recsData);
          setRecommendations(recsData);
        } catch (error) {
          console.error('Failed to load recommendations (non-critical):', error);
          // Don't fail the whole page if recommendations fail
        }
=======
        const [cyclistRes, statsRes, recsRes, authRes] = await Promise.all([
          api.get('/cyclists/me'),
          api.get('/cyclists/me/stats'),
          api.get('/recommendations'),
          api.get('/auth/me'),
        ]);

        setCyclist(cyclistRes.data);
        setStats(statsRes.data);
        setRecommendations(recsRes.data);
        setIsAdmin(authRes.data.isAdmin || false);
>>>>>>> Stashed changes
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handlePeriodChange = async (period: Period) => {
    setSelectedPeriod(period);
    setStatsLoading(true);

    try {
      const statsData = await backend.cyclists.stats({ period });
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const getPeriodLabel = () => {
    return PERIODS.find(p => p.value === selectedPeriod)?.description || 'Total';
  };

  const handleSyncStrava = async () => {
    setSyncing(true);
    try {
      const result = await backend.activities.syncStrava();
      alert(`Synchronisation réussie ! ${result.newActivitiesImported} nouvelles activités importées.`);

      // Reload stats after sync
      const statsData = await backend.cyclists.stats({ period: selectedPeriod });
      setStats(statsData);
    } catch (error: any) {
      console.error('Sync error:', error);
      alert(error.response?.data?.message || 'Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
<<<<<<< Updated upstream
      <Hero/>
=======
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
              {isAdmin && (
                <Button variant="ghost" onClick={() => router.push('/admin')}>
                  Admin
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

>>>>>>> Stashed changes
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show sync button ONLY if period is "all" and we have 0 activities */}
        {stats && stats.activityCount === 0 && selectedPeriod === 'all' && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Aucune activité trouvée</h3>
                <p className="text-sm text-muted-foreground">
                  Synchronisez vos activités Strava pour voir vos statistiques
                </p>
              </div>
              <Button
                onClick={handleSyncStrava}
                disabled={syncing}
                className="bg-[#FC4C02] hover:bg-[#E34402] text-white"
              >
                {syncing ? 'Synchronisation...' : 'Synchroniser Strava'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show info message if current period has no activities but we have activities overall */}
        {stats && stats.activityCount === 0 && selectedPeriod !== 'all' && (
          <Card className="mb-8 bg-gray-50 border-gray-200">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">
                Aucune activité pour cette période. Essayez une autre période ou ajoutez de nouvelles activités.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filtres de période */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Période</h2>
          <div className="flex gap-2 flex-wrap">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                disabled={statsLoading}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${selectedPeriod === period.value
                    ? 'bg-[#27509B] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#27509B] hover:text-[#27509B]'
                  }
                  ${statsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques principales */}
        {!stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">Chargement...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className={statsLoading ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>🚴</span>
                  Distance totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#27509B]">
                  {stats?.totalDistance?.toFixed(1) || 0} km
                </div>
                <p className="text-sm text-muted-foreground mt-1">{getPeriodLabel()}</p>
              </CardContent>
            </Card>

          <Card className={statsLoading ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>⛰️</span>
                Dénivelé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#27509B]">
                {stats?.totalElevation?.toLocaleString() || 0} m
              </div>
              <p className="text-sm text-muted-foreground mt-1">{getPeriodLabel()}</p>
            </CardContent>
          </Card>

          <Card className={statsLoading ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>📊</span>
                Activités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#27509B]">
                {stats?.activityCount || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{getPeriodLabel()}</p>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Statistiques détaillées */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className={statsLoading ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">Vitesse moyenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#27509B]">
                  {stats.averageSpeed?.toFixed(1) || 0} km/h
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Sur {stats.activityCount} sortie{stats.activityCount > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className={statsLoading ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">Distribution terrain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Route</span>
                      <span className="font-semibold">
                        {Math.round((stats.terrainDistribution?.asphalt || 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(stats.terrainDistribution?.asphalt || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tout-terrain</span>
                      <span className="font-semibold">
                        {Math.round((stats.terrainDistribution?.offroad || 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full transition-all"
                        style={{ width: `${(stats.terrainDistribution?.offroad || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mixte</span>
                      <span className="font-semibold">
                        {Math.round((stats.terrainDistribution?.mixed || 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(stats.terrainDistribution?.mixed || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lien vers les activités - show if we have stats with activities */}
        {stats && stats.activityCount > 0 && (
          <div className="mb-8">
            <Button
              onClick={() => router.push('/activities')}
              variant="outline"
              className="w-full py-6 text-lg border-2 border-[#27509B] text-[#27509B] hover:bg-[#27509B] hover:text-white"
            >
              📊 Voir toutes mes activités
            </Button>
          </div>
        )}

        {/* Recommandation de pneu */}
        {recommendations?.recommendations?.[0] && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Votre pneu recommandé</CardTitle>
              <CardDescription>
                Basé sur votre profil de roulage complet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-[#27509B]">
                    {recommendations.recommendations[0].tire.rangeName}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {recommendations.recommendations[0].explanation}
                  </p>
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
