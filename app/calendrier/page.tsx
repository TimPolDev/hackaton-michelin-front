'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Route, Mountain, ChevronRight } from 'lucide-react';
import { backend } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface ClubEvent {
  id: string;
  title: string;
  startsAt: string;
  departureLabel?: string;
  location?: string;
  distance?: number;
  elevation?: number;
  level?: string;
  bikeType?: string;
  isOfficial?: boolean;
  requiresLicense?: boolean;
  participantCount: number;
  clubId: string;
  clubName: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export default function CalendrierPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const cyclist = await backend.cyclists.me();
        setIsLoggedIn(true);

        const memberships: { club: { id: string; name: string } }[] =
          cyclist?.clubMemberships ?? [];

        const results = await Promise.allSettled(
          memberships.map(({ club }) =>
            backend.clubs
              .events(club.id, { upcoming: true, limit: 20 })
              .then((ev: Omit<ClubEvent, 'clubId' | 'clubName'>[]) =>
                ev.map((e) => ({ ...e, clubId: club.id, clubName: club.name }))
              )
          )
        );

        const all: ClubEvent[] = results.flatMap((r) =>
          r.status === 'fulfilled' ? r.value : []
        );

        all.sort(
          (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
        );

        setEvents(all);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Calendar className="h-12 w-12 text-michelin-blue" />
        <h1 className="text-2xl font-bold text-michelin-navy">Calendrier</h1>
        <p className="text-muted-foreground">Connectez-vous pour voir les événements de vos clubs.</p>
        <Link
          href="/login"
          className="rounded-full bg-michelin-blue-dark px-6 py-2.5 text-sm font-semibold text-michelin-yellow hover:opacity-90 transition-opacity"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-michelin-blue text-michelin-yellow">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-michelin-navy">Calendrier</h1>
            <p className="text-muted-foreground">Prochains événements de vos clubs</p>
          </div>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Calendar className="h-10 w-10 text-gray-300" />
              <p className="font-medium text-michelin-navy">Aucun événement à venir</p>
              <p className="text-sm text-muted-foreground">
                Les événements créés dans vos clubs apparaîtront ici.
              </p>
              <Link
                href="/clubs"
                className="mt-2 text-sm font-medium text-michelin-blue hover:underline"
              >
                Voir mes clubs
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/clubs/${event.clubId}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-michelin-navy leading-snug">
                      {event.title}
                    </CardTitle>
                    {event.isOfficial && (
                      <span className="shrink-0 rounded-full bg-michelin-yellow px-2.5 py-0.5 text-xs font-semibold text-michelin-midnight">
                        Officiel
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-michelin-blue font-medium">{event.clubName}</p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="capitalize">{formatDate(event.startsAt)}</span>
                    <span className="text-gray-400">·</span>
                    <span>{formatTime(event.startsAt)}</span>
                  </div>

                  {(event.departureLabel || event.location) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{event.departureLabel || event.location}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {event.distance != null && (
                      <div className="flex items-center gap-1">
                        <Route className="h-4 w-4 shrink-0" />
                        <span>{event.distance} km</span>
                      </div>
                    )}
                    {event.elevation != null && (
                      <div className="flex items-center gap-1">
                        <Mountain className="h-4 w-4 shrink-0" />
                        <span>{event.elevation} m</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                      <Users className="h-4 w-4 shrink-0" />
                      <span>{event.participantCount} participant{event.participantCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1.5">
                      {event.level && (
                        <span className="rounded-full border border-gray-200 px-2.5 py-0.5 text-xs">
                          {event.level}
                        </span>
                      )}
                      {event.bikeType && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-michelin-blue-dark">
                          {event.bikeType}
                        </span>
                      )}
                      {event.requiresLicense && (
                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">
                          Licence requise
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
