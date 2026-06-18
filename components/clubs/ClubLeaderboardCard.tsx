'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface LeaderboardEntry {
  cyclist: { id: string; fullName: string }; // matches back shape
  distance: number;
  elevation?: number | null;
}

interface ClubLeaderboardCardProps {
  entries: LeaderboardEntry[];
  onViewAll?: () => void;
}

const RANK_COLORS = [
  'bg-yellow-400 text-yellow-900',   // 1st
  'bg-gray-300 text-gray-700',       // 2nd
  'bg-orange-400 text-orange-900',   // 3rd
  'bg-gray-200 text-gray-600',       // 4th
  'bg-gray-200 text-gray-600',       // 5th
];

export function ClubLeaderboardCard({ entries, onViewAll }: ClubLeaderboardCardProps) {
  const top5 = entries.slice(0, 5);
  const maxDist = top5.length > 0 ? Math.max(...top5.map((e) => e.distance)) : 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Classement du mois</CardTitle>
      </CardHeader>
      <CardContent>
        {top5.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune activité pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {top5.map((entry, index) => {
              const pct = maxDist > 0 ? (entry.distance / maxDist) * 100 : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        RANK_COLORS[index] ?? RANK_COLORS[4]
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-semibold">{entry.cyclist?.fullName ?? '—'}</span>
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                          {(entry.distance ?? 0).toFixed(0)} km
                          {entry.elevation != null
                            ? ` · ${entry.elevation.toFixed(0)} m D+`
                            : ''}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-michelin-blue transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={onViewAll}
          className="mt-4 text-xs font-medium text-michelin-blue hover:underline"
        >
          Classement complet →
        </button>
      </CardContent>
    </Card>
  );
}
