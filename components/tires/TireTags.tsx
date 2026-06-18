import { cn } from '@/lib/utils';

export function splitTags(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// Bike-type tags without the E-BIKE entry (shown separately via the E-bike badge).
export function bikeTypeTags(value?: string | null): string[] {
  return splitTags(value).filter((t) => t.toUpperCase() !== 'E-BIKE');
}

type TireTagsProps = Readonly<{
  compatibleBikeTypes?: string | null;
  terrainTypes?: string | null;
  isEBikeReady?: boolean;
  className?: string;
}>;

// Pastilles d'un pneu : types de vélo, badge E-bike puis terrains.
// Partagé entre le catalogue, la fiche produit et les pneus similaires.
export function TireTags({
  compatibleBikeTypes,
  terrainTypes,
  isEBikeReady,
  className,
}: TireTagsProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {bikeTypeTags(compatibleBikeTypes).map((tag) => (
        <span
          key={`bike-${tag}`}
          className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-michelin-blue-dark"
        >
          {tag}
        </span>
      ))}
      {isEBikeReady && (
        <span className="rounded-full bg-michelin-yellow px-2 py-0.5 text-xs font-semibold text-michelin-blue-dark">
          E-bike
        </span>
      )}
      {splitTags(terrainTypes).map((tag) => (
        <span
          key={`terrain-${tag}`}
          className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
