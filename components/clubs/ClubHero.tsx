'use client';

import { Button } from '@/components/ui/button';

interface Club {
  id: string;
  name: string;
  description?: string | null;
  bikeTypes?: string[] | null;
  location?: string | null;
  foundedYear?: number | null;
  memberCount?: number | null;
  isPremium?: boolean | null;
  isMichelinPartner?: boolean | null;
  inviteCode?: string | null;
  createdAt?: string;
}

interface ClubHeroProps {
  club: Club;
  isManager: boolean;
  onManage?: () => void;
  onInvite?: () => void;
}

export function ClubHero({ club, isManager, onManage, onInvite }: ClubHeroProps) {
  const bikeTypesLabel =
    club.bikeTypes && club.bikeTypes.length > 0
      ? club.bikeTypes.join(' & ')
      : null;

  const foundedYear =
    club.foundedYear ??
    (club.createdAt ? new Date(club.createdAt).getFullYear() : null);

  return (
    <div className="relative overflow-hidden rounded-xl bg-michelin-blue-dark px-8 py-10 text-white">
      {/* Decorative Michelin circle filigree */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-60px] top-[-60px] h-72 w-72 rounded-full border-[40px] border-white/5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 top-[-20px] h-48 w-48 rounded-full border-[20px] border-white/5"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Left — title + meta + badges */}
        <div className="flex-1">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-michelin-yellow">
            Club actif
          </p>

          <h1 className="text-3xl font-bold italic leading-tight md:text-4xl">
            {club.name}
          </h1>

          {/* Meta line */}
          <p className="mt-2 text-sm text-white/70">
            {[
              club.location ? `📍 ${club.location}` : null,
              foundedYear ? `Fondé en ${foundedYear}` : null,
              bikeTypesLabel,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {club.isPremium && (
              <span className="rounded-full bg-michelin-yellow px-3 py-1 text-xs font-bold uppercase text-michelin-midnight">
                Club Premium
              </span>
            )}
            {club.memberCount != null && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase text-white">
                {club.memberCount} membres
              </span>
            )}
            {club.isMichelinPartner && (
              <span className="rounded-full border border-michelin-yellow/40 bg-white/5 px-3 py-1 text-xs font-semibold uppercase text-michelin-yellow">
                Michelin Partner
              </span>
            )}
          </div>
        </div>

        {/* Right — action buttons */}
        <div className="flex shrink-0 flex-wrap gap-3">
          {isManager && (
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={onManage}
            >
              Gérer le club
            </Button>
          )}
          <Button
            className="bg-michelin-yellow font-bold text-michelin-midnight hover:bg-michelin-yellow-dark"
            onClick={onInvite}
          >
            Inviter un membre
          </Button>
        </div>
      </div>
    </div>
  );
}
