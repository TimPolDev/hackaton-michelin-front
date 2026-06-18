'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TireTags } from '@/components/tires/TireTags';
import type { Tire } from '@/lib/api';

// Vignette produit : première image de la galerie, avec placeholder de repli.
function TireThumbnail({
  src,
  alt,
  heightClass,
  iconClass,
}: Readonly<{ src?: string | null; alt: string; heightClass: string; iconClass: string }>) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-200 ${heightClass}`}
      >
        <svg viewBox="0 0 24 24" className={`text-gray-400 ${iconClass}`} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`w-full rounded-t-lg bg-gray-50 object-contain ${heightClass}`}
      onError={() => setFailed(true)}
    />
  );
}

// Carte produit cliquable, partagée entre le catalogue et les pneus similaires.
// `compact` réduit l'image et le titre (utilisé dans les grilles secondaires).
export function TireCard({ tire, compact = false }: Readonly<{ tire: Tire; compact?: boolean }>) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/tires/${tire.id}`)}
    >
      <TireThumbnail
        src={tire.images[0]}
        alt={tire.rangeName}
        heightClass={compact ? 'h-40' : 'h-44'}
        iconClass={compact ? 'h-12 w-12' : 'h-14 w-14'}
      />
      <CardHeader>
        <CardTitle className={compact ? 'text-base' : undefined}>{tire.rangeName}</CardTitle>
        <CardDescription>
          {tire.segment}
          {tire.cycleType && (
            <span className="ml-2 rounded bg-michelin-blue-dark/10 px-1.5 py-0.5 text-xs font-medium text-michelin-blue-dark">
              {tire.cycleType}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TireTags
          compatibleBikeTypes={tire.compatibleBikeTypes}
          terrainTypes={tire.terrainTypes}
          isEBikeReady={tire.isEBikeReady}
        />
      </CardContent>
    </Card>
  );
}
