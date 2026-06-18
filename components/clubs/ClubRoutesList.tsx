'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClubRoute } from './ClubRoutesCard';

interface ClubRoutesListProps {
  routes: ClubRoute[];
  loading?: boolean;
}

const BIKE_COLORS: Record<string, string> = {
  ROAD: 'bg-blue-100 text-blue-800',
  GRAVEL: 'bg-amber-100 text-amber-800',
  MTB: 'bg-green-100 text-green-800',
  E_BIKE: 'bg-purple-100 text-purple-800',
};

function RouteThumb({ route }: { route: ClubRoute }) {
  if (route.thumbnailUrl) {
    return (
      <img
        src={route.thumbnailUrl}
        alt={route.title}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
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
  );
}

export function ClubRoutesList({ routes, loading }: ClubRoutesListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Itinéraires du club</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : routes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucun itinéraire partagé pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {routes.map((route) => {
              const bikeClass = route.bikeType
                ? (BIKE_COLORS[route.bikeType] ?? 'bg-gray-100 text-gray-800')
                : null;

              return (
                <div
                  key={route.id}
                  className="overflow-hidden rounded-lg border border-border"
                >
                  <div className="h-28 w-full bg-muted">
                    <RouteThumb route={route} />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {route.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      {bikeClass && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${bikeClass}`}>
                          {route.bikeType}
                        </span>
                      )}
                      {route.distance != null && <span>{route.distance} km</span>}
                      {route.elevation != null && <span>D+ {route.elevation} m</span>}
                    </div>
                    {route.timesRidden != null && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {route.timesRidden} fois réalisé
                        {route.timesRidden > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
