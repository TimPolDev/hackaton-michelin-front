'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export type ClubTab = 'feed' | 'classement' | 'itineraires' | 'calendrier' | 'membres';

const TABS: { value: ClubTab; label: string }[] = [
  { value: 'feed', label: 'Feed' },
  { value: 'classement', label: 'Classement' },
  { value: 'itineraires', label: 'Itinéraires' },
  { value: 'calendrier', label: 'Calendrier' },
  { value: 'membres', label: 'Membres' },
];

interface ClubTabsProps {
  active: ClubTab;
  onChange: (tab: ClubTab) => void;
}

export function ClubTabs({ active, onChange }: ClubTabsProps) {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-0 overflow-x-auto" aria-label="Onglets club">
        {TABS.map((tab) => {
          const isActive = tab.value === active;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              className={[
                'whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-michelin-blue text-michelin-blue'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
              ].join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Hook helper: reads ?tab= from URL and returns the active tab + a setter
 * that pushes a new URL param without full navigation.
 */
export function useClubTab(): [ClubTab, (tab: ClubTab) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();

  const raw = searchParams?.get('tab') ?? 'feed';
  const active: ClubTab = TABS.some((t) => t.value === raw)
    ? (raw as ClubTab)
    : 'feed';

  const setTab = useCallback(
    (tab: ClubTab) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('tab', tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return [active, setTab];
}
