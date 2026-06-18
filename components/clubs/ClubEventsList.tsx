'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClubEvent } from './ClubUpcomingEvents';

interface ClubEventsListProps {
  events: ClubEvent[];
  loading?: boolean;
  onJoin?: (eventId: string, joined: boolean) => void;
}

const LEVEL_COLORS: Record<string, string> = {
  Facile: 'text-green-700 bg-green-100',
  Modéré: 'text-amber-700 bg-amber-100',
  Difficile: 'text-red-700 bg-red-100',
  Élite: 'text-purple-700 bg-purple-100',
};

function formatEventDate(iso: string): { day: string; month: string; weekday: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
    weekday: d.toLocaleDateString('fr-FR', { weekday: 'long' }),
  };
}

export function ClubEventsList({ events, loading, onJoin }: ClubEventsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Calendrier des sorties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Aucune sortie programmée pour le moment.
          </p>
        ) : (
          events.map((event) => {
            const { day, month, weekday } = formatEventDate(event.startsAt);
            const levelClass = event.level
              ? (LEVEL_COLORS[event.level] ?? 'text-gray-700 bg-gray-100')
              : null;

            return (
              <div
                key={event.id}
                className="flex items-start gap-4 rounded-lg border border-border p-4"
              >
                {/* Date pastille */}
                <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-michelin-blue-dark text-white">
                  <span className="text-lg font-bold leading-none">{day}</span>
                  <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {month}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs capitalize text-muted-foreground">{weekday}</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {event.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {event.bikeType && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {event.bikeType}
                      </span>
                    )}
                    {event.distance != null && <span>{event.distance} km</span>}
                    {event.elevation != null && <span>D+ {event.elevation} m</span>}
                    {levelClass && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${levelClass}`}>
                        {event.level}
                      </span>
                    )}
                  </div>
                  {event.participantCount != null && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      👥 {event.participantCount} participant
                      {event.participantCount > 1 ? 's' : ''} confirmé
                      {event.participantCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant={event.isJoined ? 'secondary' : 'default'}
                  className={
                    event.isJoined
                      ? 'shrink-0 text-xs'
                      : 'shrink-0 bg-michelin-yellow text-michelin-midnight text-xs hover:bg-michelin-yellow-dark'
                  }
                  onClick={() => onJoin?.(event.id, !event.isJoined)}
                >
                  {event.isJoined ? 'Inscrit' : 'Rejoindre'}
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
