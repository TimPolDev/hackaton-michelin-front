'use client';

export type FeedItemType = 'RIDE' | 'ROUTE_SHARED' | 'EVENT_JOINED';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  cyclist: { id: string; fullName: string };
  createdAt: string; // ISO
  bikeType?: string | null;
  title: string;
  subtitle?: string | null;
  // RIDE fields
  distance?: number | null;   // km
  elevation?: number | null;  // m
  duration?: number | null;   // seconds
  avgSpeed?: number | null;   // km/h
  // back may also send extra type-specific fields; ignore them
}

interface ClubFeedProps {
  items: FeedItem[];
  loading?: boolean;
}

const TYPE_ACTION: Record<FeedItemType, string> = {
  RIDE: 'A complété',
  ROUTE_SHARED: 'A partagé un nouvel itinéraire',
  EVENT_JOINED: 'A rejoint l\'événement',
};

const BIKE_TYPE_COLORS: Record<string, string> = {
  ROAD: 'bg-blue-100 text-blue-800',
  GRAVEL: 'bg-amber-100 text-amber-800',
  MTB: 'bg-green-100 text-green-800',
  E_BIKE: 'bg-purple-100 text-purple-800',
  COMMUTING: 'bg-gray-100 text-gray-800',
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'à l\'instant';
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

const AVATAR_COLORS = [
  'bg-michelin-blue text-white',
  'bg-michelin-yellow text-michelin-midnight',
  'bg-emerald-600 text-white',
  'bg-violet-600 text-white',
  'bg-rose-600 text-white',
];

function getAvatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClubFeed({ items, loading }: ClubFeedProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
        Aucune activité récente — les sorties du club apparaîtront ici.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const name = item.cyclist?.fullName ?? '?';
        const initials = getInitials(name);
        const avatarClass = getAvatarColor(name);
        const bikeColorClass = item.bikeType
          ? (BIKE_TYPE_COLORS[item.bikeType] ?? 'bg-gray-100 text-gray-800')
          : null;

        const hasStats =
          item.distance != null ||
          item.elevation != null ||
          item.duration != null ||
          item.avgSpeed != null;

        const durationLabel = item.duration != null
          ? `${Math.floor(item.duration / 3600)}h${String(Math.floor((item.duration % 3600) / 60)).padStart(2, '0')}`
          : null;

        return (
          <div
            key={item.id}
            className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            {/* Avatar */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClass}`}
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              {/* Top row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                {bikeColorClass && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${bikeColorClass}`}>
                    {item.bikeType}
                  </span>
                )}
              </div>

              {/* Action + title */}
              <p className="mt-0.5 text-sm text-muted-foreground">
                {TYPE_ACTION[item.type]}{' '}
                <span className="font-medium text-foreground">{item.title}</span>
              </p>

              {item.subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
              )}

              {/* Stats row */}
              {hasStats && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {item.distance != null && (
                    <span className="font-medium text-foreground">
                      {item.distance.toLocaleString('fr-FR')} km
                    </span>
                  )}
                  {item.elevation != null && (
                    <span>{item.elevation.toLocaleString('fr-FR')} m D+</span>
                  )}
                  {durationLabel && <span>{durationLabel}</span>}
                  {item.avgSpeed != null && (
                    <span>{item.avgSpeed.toFixed(1)} km/h moy.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
