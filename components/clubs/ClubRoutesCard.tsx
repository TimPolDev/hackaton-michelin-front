'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ClubRoute {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  bikeType?: string | null;
  distance?: number | null;   // km — matches back field name
  elevation?: number | null;  // m
  timesRidden?: number | null; // matches back field name
}

interface ClubRoutesCardProps {
  routes: ClubRoute[];
  loading?: boolean;
  onViewAll?: () => void;
}

const BIKE_COLORS: Record<string, string> = {
  ROAD: 'bg-blue-100 text-blue-800',
  GRAVEL: 'bg-amber-100 text-amber-800',
  MTB: 'bg-green-100 text-green-800',
  E_BIKE: 'bg-purple-100 text-purple-800',
};

export function ClubRoutesCard({ routes, loading, onViewAll }: ClubRoutesCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Itinéraires du club</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : routes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun itinéraire partagé — à venir.
          </p>
        ) : (
          routes.slice(0, 3).map((route) => {
            const bikeClass = route.bikeType
              ? (BIKE_COLORS[route.bikeType] ?? 'bg-gray-100 text-gray-800')
              : null;

            return (
              <div
                key={route.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                {/* Thumbnail or placeholder */}
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {route.thumbnailUrl ? (
                    <img
                      src={route.thumbnailUrl}
                      alt={route.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {route.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {bikeClass && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${bikeClass}`}>
                        {route.bikeType}
                      </span>
                    )}
                    {route.distance != null && <span>{route.distance} km</span>}
                    {route.elevation != null && <span>D+ {route.elevation} m</span>}
                    {route.timesRidden != null && (
                      <span>{route.timesRidden} fois réalisé</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <button
          type="button"
          onClick={onViewAll}
          className="mt-1 text-xs font-medium text-michelin-blue hover:underline"
        >
          Voir tout →
        </button>
      </CardContent>
    </Card>
  );
}
