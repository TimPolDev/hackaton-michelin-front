'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Tire {
  id: string;
  rangeName: string;
  brand: string;
  compatibleBikeTypes: string;
}

interface Recommendation {
  tire: Tire;
  score: number;
  explanation: string;
}

interface ClubUserRecommendationCardProps {
  recommendation: Recommendation | null;
  loading?: boolean;
  onViewDetails?: (tireId: string) => void;
}

export function ClubUserRecommendationCard({
  recommendation,
  loading,
  onViewDetails,
}: ClubUserRecommendationCardProps) {
  return (
    <Card className="border-michelin-yellow/30 bg-michelin-blue-dark text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {/* Michelin badge */}
          <span className="rounded-full bg-michelin-yellow px-2 py-0.5 text-[10px] font-bold uppercase text-michelin-midnight">
            Michelin
          </span>
          <CardTitle className="text-sm text-white">Votre pneu recommandé</CardTitle>
        </div>
        <p className="text-xs text-white/60">
          Basé sur votre profil de roulage
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-6 animate-pulse rounded-lg bg-white/10" />
            <div className="h-16 animate-pulse rounded-lg bg-white/10" />
          </div>
        ) : !recommendation ? (
          <p className="text-sm text-white/50">
            Aucune recommandation disponible. Ajoutez des activités pour obtenir des recommandations personnalisées.
          </p>
        ) : (
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold text-michelin-yellow mb-1">
                {recommendation.tire.rangeName}
              </h3>
              <p className="text-xs text-white/60">
                {recommendation.tire.brand}
              </p>
            </div>

            <p className="text-sm text-white/80 leading-relaxed">
              {recommendation.explanation}
            </p>

            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>🚴</span>
                <span>{recommendation.tire.compatibleBikeTypes.split(',').join(' • ')}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          size="sm"
          className="mt-2 w-full bg-michelin-yellow text-michelin-midnight text-xs hover:bg-michelin-yellow-dark"
          onClick={() => recommendation && onViewDetails?.(recommendation.tire.id)}
          disabled={!recommendation}
        >
          Voir plus de détails →
        </Button>
      </CardContent>
    </Card>
  );
}
