'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ClubKpiStats {
  totalDistanceKm?: number | null;
  totalDistanceDelta?: string | null;   // e.g. "▲ +19% vs juin"
  activeMembers?: number | null;
  activeMembersDelta?: string | null;   // e.g. "▲ +3 ce mois"
  ridesThisMonth?: number | null;
  ridesDelta?: string | null;           // e.g. "▲ régulier"
  upcomingEvents?: number | null;
  upcomingEventsLabel?: string | null;  // e.g. "Prochain : sam."
  avgElevationPerRide?: number | null;
  avgElevationDelta?: string | null;    // e.g. "▲ +12%"
}

interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: string | null;
  unit?: string;
}

function KpiCard({ title, value, delta, unit }: KpiCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {value}
          {unit && (
            <span className="ml-1 text-base font-semibold text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {delta && (
          <p className="mt-1 text-xs text-muted-foreground">{delta}</p>
        )}
      </CardContent>
    </Card>
  );
}

interface ClubKpiCardsProps {
  stats: ClubKpiStats | null | undefined;
}

export function ClubKpiCards({ stats }: ClubKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        title="Total club ce mois"
        value={stats?.totalDistanceKm != null ? stats.totalDistanceKm.toLocaleString('fr-FR') : '—'}
        unit={stats?.totalDistanceKm != null ? 'km' : undefined}
        delta={stats?.totalDistanceDelta ?? undefined}
      />
      <KpiCard
        title="Membres actifs"
        value={stats?.activeMembers ?? '—'}
        delta={stats?.activeMembersDelta ?? undefined}
      />
      <KpiCard
        title="Sorties ce mois"
        value={stats?.ridesThisMonth ?? '—'}
        delta={stats?.ridesDelta ?? undefined}
      />
      <KpiCard
        title="Événements à venir"
        value={stats?.upcomingEvents ?? '—'}
        delta={stats?.upcomingEventsLabel ?? undefined}
      />
      <KpiCard
        title="D+ moyen / sortie"
        value={stats?.avgElevationPerRide != null ? stats.avgElevationPerRide.toLocaleString('fr-FR') : '—'}
        unit={stats?.avgElevationPerRide != null ? 'm' : undefined}
        delta={stats?.avgElevationDelta ?? undefined}
      />
    </div>
  );
}
