'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
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
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('all');
  const [syncing, setSyncing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

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
    return <PageLoader label="Chargement du tableau de bord..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-yellow-50/20">
      <Hero/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Recommandation de pneu - EN HAUT ET MISE EN AVANT */}
        {recommendations?.recommendations?.[0] && (
          <Card className="relative overflow-hidden border-2 border-[#FCE500] bg-gradient-to-br from-[#27509B] via-[#2d5ba8] to-[#27509B] shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCE500]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FCE500]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <CardHeader className="relative z-10 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-[#FCE500] text-[#27509B] text-xs font-bold uppercase rounded-full">
                  Michelin Recommande
                </span>
                <span className="text-[#FCE500]/60 text-sm">Basé sur votre profil</span>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-extrabold text-white italic">
                {recommendations.recommendations[0].tire.rangeName}
              </CardTitle>
              <CardDescription className="text-white/70 text-base mt-2">
                {recommendations.recommendations[0].explanation}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => router.push(`/tires/${recommendations.recommendations[0].tire.id}`)}
                  size="lg"
                  className="bg-[#FCE500] hover:bg-[#e5d000] text-[#27509B] font-bold shadow-lg"
                >
                  Voir les détails du pneu →
                </Button>
                <Button
                  onClick={() => router.push('/activities')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-[#27509B] hover:bg-white hover:text-[#27509B]"
                >
                  📊 Mes activités
                </Button>
              </div>

              {recommendations.matchedAmbassador && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#FCE500] text-2xl">⭐</span>
                    <h4 className="font-bold text-white text-sm uppercase tracking-wide">Utilisé par un ambassadeur</h4>
                  </div>
                  <p className="font-semibold text-white text-lg mb-1">{recommendations.matchedAmbassador.fullName}</p>
                  <p className="text-white/70 text-sm mb-3">{recommendations.matchedAmbassador.bio}</p>
                  <p className="text-[#FCE500] italic text-sm leading-relaxed">
                    "{recommendations.matchedAmbassador.testimonial}"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show sync button ONLY if period is "all" and we have 0 activities */}
        {stats && stats.activityCount === 0 && selectedPeriod === 'all' && (
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200 shadow-lg">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1 text-orange-900">Aucune activité trouvée</h3>
                <p className="text-sm text-orange-700">
                  Synchronisez vos activités Strava pour voir vos statistiques et obtenir des recommandations
                </p>
              </div>
              <Button
                onClick={handleSyncStrava}
                disabled={syncing}
                className="bg-[#27509B] hover:bg-[#1e3f7a] text-white"
              >
                {syncing ? 'Synchronisation...' : 'Synchroniser Strava'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Show info message if current period has no activities but we have activities overall */}
        {stats && stats.activityCount === 0 && selectedPeriod !== 'all' && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 text-lg">
                Aucune activité pour cette période. Essayez une autre période ou ajoutez de nouvelles activités.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filtres de période */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-600 mb-4 flex items-center gap-2">
            <span className="text-[#27509B]">📅</span>
            Période d'analyse
          </h2>
          <div className="flex gap-3 flex-wrap">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                disabled={statsLoading}
                className={`
                  px-6 py-3 rounded-xl font-semibold text-sm transition-all transform hover:scale-105
                  ${selectedPeriod === period.value
                    ? 'bg-gradient-to-r from-[#27509B] to-[#1d3d7a] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#27509B] hover:text-[#27509B] shadow-md'
                  }
                  ${statsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="text-center">
                  <div className="font-bold">{period.label}</div>
                  <div className="text-xs opacity-70">{period.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques principales */}
        {!stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Chargement...</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`shadow-lg hover:shadow-xl transition-all border-l-4 border-l-[#27509B] ${statsLoading ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-600 flex items-center gap-2">
                  <span className="text-2xl">🚴</span>
                  Distance totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-[#27509B] mb-1">
                  {stats?.totalDistance?.toFixed(1) || 0}
                  <span className="text-xl ml-2 text-gray-500">km</span>
                </div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{getPeriodLabel()}</p>
              </CardContent>
            </Card>

            <Card className={`shadow-lg hover:shadow-xl transition-all border-l-4 border-l-[#FCE500] ${statsLoading ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-600 flex items-center gap-2">
                  <span className="text-2xl">⛰️</span>
                  Dénivelé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-[#27509B] mb-1">
                  {stats?.totalElevation?.toLocaleString() || 0}
                  <span className="text-xl ml-2 text-gray-500">m</span>
                </div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{getPeriodLabel()}</p>
              </CardContent>
            </Card>

            <Card className={`shadow-lg hover:shadow-xl transition-all border-l-4 border-l-[#27509B] ${statsLoading ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-600 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Activités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-[#27509B] mb-1">
                  {stats?.activityCount || 0}
                  <span className="text-xl ml-2 text-gray-500">sorties</span>
                </div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{getPeriodLabel()}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistiques détaillées */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`shadow-lg hover:shadow-xl transition-all ${statsLoading ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-transparent">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-600 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Vitesse moyenne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-[#27509B] mb-2">
                  {stats.averageSpeed?.toFixed(1) || 0}
                  <span className="text-xl ml-2 text-gray-500">km/h</span>
                </div>
                <p className="text-sm text-gray-600">
                  Sur {stats.activityCount} sortie{stats.activityCount > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className={`shadow-lg hover:shadow-xl transition-all ${statsLoading ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3 bg-gradient-to-r from-yellow-50 to-transparent">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-gray-600 flex items-center gap-2">
                  <span className="text-2xl">🗺️</span>
                  Distribution terrain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-semibold">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#27509B]"></span>
                        Route
                      </span>
                      <span className="text-[#27509B]">
                        {Math.round((stats.terrainDistribution?.asphalt || 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-[#27509B] to-[#1d3d7a] rounded-full transition-all duration-500"
                        style={{ width: `${(stats.terrainDistribution?.asphalt || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2 font-semibold">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-600"></span>
                        Tout-terrain
                      </span>
                      <span className="text-green-600">
                        {Math.round((stats.terrainDistribution?.offroad || 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-green-600 to-green-700 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.terrainDistribution?.offroad || 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2 font-semibold">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                        Mixte
                      </span>
                      <span className="text-orange-500">
                        {Math.round((stats.terrainDistribution?.mixed || 0) * 100)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.terrainDistribution?.mixed || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
