'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface TireRenewalMember {
  cyclistId: string;
  fullName: string;       // matches back field name
  currentKm: number;
  thresholdKm: number;    // matches back field name
}

interface ClubTireRenewalCardProps {
  members: TireRenewalMember[];
  loading?: boolean;
  onViewRecommendations?: () => void;
}

export function ClubTireRenewalCard({
  members,
  loading,
  onViewRecommendations,
}: ClubTireRenewalCardProps) {
  return (
    <Card className="border-michelin-yellow/30 bg-michelin-blue-dark text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {/* Michelin badge */}
          <span className="rounded-full bg-michelin-yellow px-2 py-0.5 text-[10px] font-bold uppercase text-michelin-midnight">
            Michelin
          </span>
          <CardTitle className="text-sm text-white">Renouvellement pneus</CardTitle>
        </div>
        <p className="text-xs text-white/60">
          Membres proches du seuil de remplacement recommandé
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-white/10" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-white/50">
            Aucun renouvellement imminent — à venir dès que les données pneus seront disponibles.
          </p>
        ) : (
          members.slice(0, 3).map((m, i) => {
            const pct = Math.min((m.currentKm / m.thresholdKm) * 100, 100);
            const isWorn = pct >= 80;

            return (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{m.fullName}</span>
                  <span className="text-xs text-white/60">
                    {m.currentKm.toLocaleString('fr-FR')} / {m.thresholdKm.toLocaleString('fr-FR')} km
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isWorn ? 'bg-michelin-yellow' : 'bg-white/60'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}

        <Button
          size="sm"
          className="mt-2 w-full bg-michelin-yellow text-michelin-midnight text-xs hover:bg-michelin-yellow-dark"
          onClick={onViewRecommendations}
        >
          Voir les recommandations →
        </Button>
      </CardContent>
    </Card>
  );
}
