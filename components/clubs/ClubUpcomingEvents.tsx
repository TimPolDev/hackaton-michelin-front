'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ClubEvent {
  id: string;
  title: string;
  startsAt: string; // ISO — matches back field name
  distance?: number | null;   // km
  elevation?: number | null;  // m
  level?: string | null;      // "Découverte" | "Intermédiaire" | "Avancé"
  bikeType?: string | null;
  participantCount?: number | null;
  isJoined?: boolean; // optimistic UI only — not returned by back
}

interface ClubUpcomingEventsProps {
  events: ClubEvent[];
  loading?: boolean;
  onJoin?: (eventId: string, joined: boolean) => void;
  onViewAll?: () => void;
}

const LEVEL_COLORS: Record<string, string> = {
  Facile: 'text-green-700 bg-green-100',
  Modéré: 'text-amber-700 bg-amber-100',
  Difficile: 'text-red-700 bg-red-100',
  Élite: 'text-purple-700 bg-purple-100',
};

function formatEventDate(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
  };
}

export function ClubUpcomingEvents({
  events,
  loading,
  onJoin,
  onViewAll,
}: ClubUpcomingEventsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Prochaines sorties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune sortie à venir pour le moment.
          </p>
        ) : (
          events.slice(0, 3).map((event) => {
            const { day, month } = formatEventDate(event.startsAt);
            const levelClass =
              event.level ? (LEVEL_COLORS[event.level] ?? 'text-gray-700 bg-gray-100') : null;

            return (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                {/* Date pastille */}
                <div className="flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-michelin-blue-dark text-white">
                  <span className="text-base font-bold leading-none">{day}</span>
                  <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {month}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {event.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
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

        <button
          type="button"
          onClick={onViewAll}
          className="mt-1 text-xs font-medium text-michelin-blue hover:underline"
        >
          Calendrier →
        </button>
      </CardContent>
    </Card>
  );
}
