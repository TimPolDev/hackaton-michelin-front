'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Mountain, Route, Crown, Medal, Users } from 'lucide-react';
import { backend } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Metric = 'distance' | 'elevation';
type Period = 'all' | 'season' | 'month' | 'week';

interface LeaderboardEntry {
  cyclistId: string;
  cyclistName: string;
  isAmbassador: boolean;
  distance: number;
  elevation: number;
  activityCount: number;
  rank: number;
}

interface LeaderboardResponse {
  period: string;
  totalRiders: number;
  totalDistance: number;
  totalElevation: number;
  leaderboard: LeaderboardEntry[];
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'all', label: 'Total' },
  { value: 'season', label: 'Saison' },
  { value: 'month', label: 'Mois' },
  { value: 'week', label: 'Semaine' },
];

const METRICS: { value: Metric; label: string; unit: string; icon: typeof Route }[] = [
  { value: 'distance', label: 'Distance', unit: 'km', icon: Route },
  { value: 'elevation', label: 'Dénivelé', unit: 'm', icon: Mountain },
];

const PODIUM_STYLES = [
  { ring: 'ring-michelin-yellow', badge: 'bg-michelin-yellow text-michelin-midnight', order: 'md:order-2', scale: 'md:-translate-y-4', icon: Crown },
  { ring: 'ring-gray-300', badge: 'bg-gray-300 text-gray-700', order: 'md:order-1', scale: '', icon: Medal },
  { ring: 'ring-orange-400', badge: 'bg-orange-400 text-orange-900', order: 'md:order-3', scale: '', icon: Medal },
];

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ClassementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(false);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [period, setPeriod] = useState<Period>('all');
  const [metric, setMetric] = useState<Metric>('distance');
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        const cyclist = await backend.cyclists.me();
        setMyId(cyclist?.id ?? null);
      } catch (error) {
        console.error('Error loading classement:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  useEffect(() => {
    if (loading) return;
    const loadBoard = async () => {
      setBoardLoading(true);
      try {
        const res = await backend.cyclists.leaderboard({ period });
        setData(res);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        setData(null);
      } finally {
        setBoardLoading(false);
      }
    };
    loadBoard();
  }, [period, loading]);

  const ranked = useMemo(() => {
    const entries = data?.leaderboard ?? [];
    return [...entries].sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0));
  }, [data, metric]);

  const maxValue = ranked.length > 0 ? ranked[0][metric] ?? 0 : 0;
  const metricConfig = METRICS.find((m) => m.value === metric)!;

  const formatValue = (value: number) =>
    metric === 'distance' ? value.toFixed(0) : Math.round(value).toLocaleString();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-michelin-blue text-michelin-yellow">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-michelin-navy">Classement</h1>
            <p className="text-muted-foreground">Les cyclistes les plus actifs de la communauté</p>
          </div>
        </div>

        {/* Filtres de période */}
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Période</h2>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                disabled={boardLoading}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  period === p.value
                    ? 'bg-michelin-blue text-white shadow-md'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-michelin-blue hover:text-michelin-blue'
                } ${boardLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cartes de synthèse */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className={boardLoading ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-michelin-blue" />
                Cyclistes classés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-michelin-blue">{data?.totalRiders ?? 0}</div>
            </CardContent>
          </Card>

          <Card className={boardLoading ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Route className="h-5 w-5 text-michelin-blue" />
                Distance cumulée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-michelin-blue">
                {(data?.totalDistance ?? 0).toLocaleString()} km
              </div>
            </CardContent>
          </Card>

          <Card className={boardLoading ? 'opacity-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mountain className="h-5 w-5 text-michelin-blue" />
                Dénivelé cumulé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-michelin-blue">
                {(data?.totalElevation ?? 0).toLocaleString()} m
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bascule de métrique */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-michelin-navy">Classement détaillé</h2>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            {METRICS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.value}
                  onClick={() => setMetric(m.value)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    metric === m.value
                      ? 'bg-michelin-blue text-white shadow-sm'
                      : 'text-gray-600 hover:text-michelin-blue'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {ranked.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune activité enregistrée sur cette période.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Podium */}
            {ranked.length >= 3 && (
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
                {ranked.slice(0, 3).map((entry, i) => {
                  const p = PODIUM_STYLES[i];
                  const PodiumIcon = p.icon;
                  const me = entry.cyclistId === myId;
                  return (
                    <div key={entry.cyclistId} className={`${p.order} ${p.scale}`}>
                      <Card className={`ring-2 ${p.ring} ${me ? 'bg-michelin-blue-light/40' : ''}`}>
                        <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${p.badge}`}>
                            <PodiumIcon className="h-5 w-5" />
                          </div>
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-michelin-blue-dark text-lg font-bold text-michelin-yellow">
                            {getInitials(entry.cyclistName)}
                          </div>
                          <div className="font-semibold text-michelin-navy">
                            {entry.cyclistName}
                            {me && <span className="ml-1 text-xs font-normal text-michelin-blue">(vous)</span>}
                          </div>
                          <div className="text-2xl font-bold text-michelin-blue">
                            {formatValue(entry[metric] ?? 0)}{' '}
                            <span className="text-sm font-medium text-muted-foreground">{metricConfig.unit}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Liste complète */}
            <Card className={boardLoading ? 'opacity-50' : ''}>
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-100">
                  {ranked.map((entry, index) => {
                    const value = entry[metric] ?? 0;
                    const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    const me = entry.cyclistId === myId;
                    return (
                      <li
                        key={entry.cyclistId}
                        className={`flex items-center gap-4 px-4 py-3 sm:px-6 ${me ? 'bg-michelin-blue-light/30' : ''}`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            index === 0
                              ? 'bg-michelin-yellow text-michelin-midnight'
                              : index === 1
                              ? 'bg-gray-300 text-gray-700'
                              : index === 2
                              ? 'bg-orange-400 text-orange-900'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-michelin-blue-dark text-sm font-semibold text-michelin-yellow">
                          {getInitials(entry.cyclistName)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-semibold text-michelin-navy">
                              {entry.cyclistName}
                              {entry.isAmbassador && (
                                <span className="ml-2 rounded-full bg-michelin-yellow px-2 py-0.5 text-[10px] font-semibold text-michelin-midnight align-middle">
                                  Ambassadeur
                                </span>
                              )}
                              {me && <span className="ml-1 text-xs font-normal text-michelin-blue">(vous)</span>}
                            </p>
                            <p className="shrink-0 font-bold text-michelin-blue">
                              {formatValue(value)}{' '}
                              <span className="text-xs font-medium text-muted-foreground">{metricConfig.unit}</span>
                            </p>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-michelin-blue transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {entry.activityCount} sortie{entry.activityCount > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
