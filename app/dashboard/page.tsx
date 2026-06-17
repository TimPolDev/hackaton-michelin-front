'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { backend } from '@/lib/api';
import Hero, { type HeroStats } from './components/hero';
import MichelinBadge from './components/michelin-badge';

export default function DashboardPage() {
  const [name, setName] = useState<string | undefined>();
  const [stats, setStats] = useState<HeroStats | undefined>();
  const [ambassadors, setAmbassadors] = useState<AmbassadorCardProps[] | undefined>();

  useEffect(() => {
    // Hero : nom + stats du cycliste connecté.
    backend.cyclists
      .me()
      .then((me) => setName(me?.fullName ?? undefined))
      .catch(() => {});

    backend.cyclists
      .stats()
      .then((s) =>
        setStats({
          distance: s?.totalDistance,
          rides: s?.activityCount,
          // Pas de route pour le nombre de clubs de l'utilisateur → reste mocké.
        }),
      )
      .catch(() => {});

    // Section ambassadeurs.
    backend.ambassadors
      .list()
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setAmbassadors(list.map(mapAmbassador));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="bg-[#f4f4f2]">
      <Hero name={name} stats={stats} />

      <div className="mx-auto max-w-[1440px] px-6 pb-20 md:px-16">
        <AlertBanner />

        {/* Mes clubs + État pneus — pas de route back disponible, données mockées */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ClubsCard />
          <TireStatusCard />
        </div>

        {/* Athlètes partenaires */}
        <SectionHeading
          eyebrow="Athlètes partenaires"
          title="Ceux qui roulent avec Michelin"
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(ambassadors ?? MOCK_AMBASSADORS).map((a) => (
            <AmbassadorCard key={a.name} {...a} />
          ))}
        </div>
      </div>
    </main>
  );
}

/* ----------------------------- Alert banner ----------------------------- */

function AlertBanner() {
  return (
    <div className="my-7 flex flex-col gap-4 rounded border border-[#c5d4ee] bg-[#eef3fb] px-5 py-4 sm:flex-row sm:items-center">
      <MichelinBadge />
      <div className="flex-1 space-y-1">
        <p className="text-[13px] font-bold text-[#1b3f7a]">
          3 membres de Lyon Gravel Riders approchent des 3 000 km — dont vous
        </p>
        <p className="text-xs text-[#666]">
          Vos pneus sont à 74% d&apos;usure estimée. Un remplacement est recommandé dans
          environ 200 km.
        </p>
      </div>
      <Link
        href="/recommandation"
        className="shrink-0 rounded-[3px] bg-[#27509b] px-[18px] py-[9px] text-center text-xs font-bold text-white transition-opacity hover:opacity-90"
      >
        Voir ma recommandation →
      </Link>
    </div>
  );
}

/* ------------------------------- Mes clubs ------------------------------ */
/* Aucune route back « mes clubs » : données de maquette conservées. */

const CLUBS = [
  { icon: '🚵', name: 'Lyon Gravel Riders', distance: '660 km ce mois', members: '34 membres', tint: 'bg-[#d6e0f5]' },
  { icon: '🚴', name: 'Velo Club Lyonnais', distance: '142 km ce mois', members: '52 membres', tint: 'bg-[#d5e8d4]' },
  { icon: '☕', name: 'Les Copains du Dimanche', distance: '45 km ce mois', members: '8 membres', tint: 'bg-[#edd5c5]' },
];

function ClubsCard() {
  return (
    <section className="flex flex-col gap-4 rounded border border-[#e2e2e2] bg-white px-6 py-5 lg:col-span-2">
      <header className="flex items-center justify-between">
        <CardTitle>Mes clubs</CardTitle>
        <Link href="/clubs" className="text-[10px] font-semibold text-[#27509b] hover:underline">
          Gérer mes clubs →
        </Link>
      </header>

      <div className="flex flex-col gap-2.5">
        {CLUBS.map((club) => (
          <div
            key={club.name}
            className="flex items-center gap-3 rounded-[3px] border border-[#e2e2e2] px-4 py-3"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-[3px] text-base ${club.tint}`}
            >
              {club.icon}
            </span>
            <p className="flex-1 text-[13px] font-bold text-[#111]">{club.name}</p>
            <p className="text-xs font-bold text-[#27509b]">{club.distance}</p>
            <p className="hidden text-[10px] text-[#aaa] sm:block">{club.members}</p>
            <span className="text-xs text-[#ccc]">›</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ État pneus ------------------------------ */
/* Pas de route d'usure pneu : données de maquette conservées. */

function TireStatusCard() {
  return (
    <section className="flex flex-col gap-4 rounded border border-[#e2e2e2] bg-white px-6 py-5">
      <CardTitle>État pneus</CardTitle>

      <div className="flex flex-col gap-2.5 rounded border border-[#ffe082] bg-[#fff8e1] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <MichelinBadge size="md" />
          <p className="text-[13px] font-bold text-[#111]">Power Road TLR</p>
        </div>

        {/* Barre d'usure */}
        <div className="h-[7px] w-full overflow-hidden rounded bg-[#ffe082]">
          <div className="h-full w-[74%] rounded bg-[#e65100]" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-[#e65100]">74% usé</p>
            <p className="text-[11px] text-[#888]">~200 km restants</p>
          </div>
          <button
            type="button"
            className="rounded-[3px] bg-[#e65100] px-3.5 py-[7px] text-[11px] font-bold text-white transition-opacity hover:opacity-90"
          >
            Changer →
          </button>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Ambassadeurs ------------------------------ */

type AmbassadorCardProps = {
  emoji: string;
  tag: string;
  tint: string;
  name: string;
  role: string;
  quote: string;
  tire: string;
  spec: string;
};

// Habillage visuel par type de vélo (le back ne fournit pas emoji/teinte).
const BIKE_VISUALS: Record<string, { emoji: string; tag: string; tint: string }> = {
  ROAD: { emoji: '🚴', tag: 'Route', tint: 'bg-[#d6e0f5]' },
  GRAVEL: { emoji: '⛰️', tag: 'Gravel', tint: 'bg-[#d5e8d4]' },
  MTB: { emoji: '🌲', tag: 'VTT', tint: 'bg-[#edd5c5]' },
  E_BIKE: { emoji: '⚡', tag: 'E-Bike', tint: 'bg-[#d6e0f5]' },
  COMMUTING: { emoji: '🚲', tag: 'Ville', tint: 'bg-[#edd5c5]' },
};
const DEFAULT_VISUAL = { emoji: '🚴', tag: 'Vélo', tint: 'bg-[#d6e0f5]' };

// Forme partielle de la réponse back `ambassadors.list()` utilisée ici.
type BackendAmbassador = {
  bio?: string;
  discipline?: string;
  skillLevel?: string;
  cyclist?: { fullName?: string; primaryBikeType?: string };
  tires?: Array<{ bikeType?: string; testimonial?: string; tire?: { rangeName?: string } }>;
};

// Mappe la réponse back `ambassadors.list()` vers les props de la carte.
function mapAmbassador(a: BackendAmbassador): AmbassadorCardProps {
  const firstTire = a?.tires?.[0];
  const bikeType: string = firstTire?.bikeType ?? a?.cyclist?.primaryBikeType ?? '';
  const visual = BIKE_VISUALS[bikeType] ?? DEFAULT_VISUAL;

  return {
    ...visual,
    name: a?.cyclist?.fullName ?? 'Ambassadeur',
    role: [a?.discipline, a?.skillLevel].filter(Boolean).join(' · ') || visual.tag,
    quote: firstTire?.testimonial ?? a?.bio ?? '',
    tire: firstTire?.tire?.rangeName ?? '—',
    spec: bikeType ? (BIKE_VISUALS[bikeType]?.tag ?? bikeType) : '—',
  };
}

// Repli maquette Figma utilisé tant que la route ne renvoie rien.
const MOCK_AMBASSADORS: AmbassadorCardProps[] = [
  {
    emoji: '🚴',
    tag: 'Route',
    tint: 'bg-[#d6e0f5]',
    name: 'Marc Delacroix',
    role: 'Pro Continental · Route',
    quote:
      "La régularité du grip en descente mouillée fait toute la différence sur les grands cols alpins. Avec le Power Road, je n'hésite plus.",
    tire: 'Power Road TLR',
    spec: '700×25c · Tubeless Ready',
  },
  {
    emoji: '⛰️',
    tag: 'Gravel',
    tint: 'bg-[#d5e8d4]',
    name: 'Lucie Vernay',
    role: 'Ultra-distance · Gravel',
    quote:
      'Sur 400 km de bikepacking, le confort et la durabilité sont non-négociables. Le Power Gravel tient sur tous les terrains.',
    tire: 'Power Gravel',
    spec: '700×40c · TLR',
  },
  {
    emoji: '🌲',
    tag: 'VTT Enduro',
    tint: 'bg-[#edd5c5]',
    name: 'Théo Brun',
    role: 'Enduro · Compétition nationale',
    quote:
      "Le grip latéral en dévers boueux, il n'y a que Michelin pour tenir comme ça. Wild Enduro avant et arrière depuis 2 saisons.",
    tire: 'Wild Enduro',
    spec: '29×2.4 · Front + Rear',
  },
];

function AmbassadorCard({ emoji, tag, tint, name, role, quote, tire, spec }: AmbassadorCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded border border-[#e2e2e2] bg-white">
      {/* Visuel */}
      <div className={`relative flex h-[180px] items-center justify-center ${tint}`}>
        <span className="text-[64px] leading-none">{emoji}</span>
        <span className="absolute right-4 top-3.5 rounded-[2px] bg-[#27509b] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FCE500]">
          {tag}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-extrabold italic text-[#111]">{name}</h3>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-[#27509b]">
            {role}
          </p>
        </div>

        <hr className="border-[#e2e2e2]" />

        <blockquote className="border-l-[3px] border-[#FCE500] pl-3 text-[13px] italic leading-relaxed text-[#444]">
          {quote}
        </blockquote>

        <div>
          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-[#888]">Son pneu</p>
          <div className="flex items-center gap-2.5 rounded-[3px] bg-[#eef3fb] px-3 py-2.5">
            <MichelinBadge size="sm" />
            <div>
              <p className="text-[13px] font-bold text-[#1b3f7a]">{tire}</p>
              <p className="text-[11px] text-[#888]">{spec}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ Primitives ------------------------------ */

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-[13px] w-[3px] rounded-[1px] bg-[#FCE500]" />
      <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#27509b]">
        {children}
      </h2>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5 mt-12">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#27509b]">{eyebrow}</p>
      <h2 className="mt-2 text-[28px] font-extrabold italic text-[#111]">{title}</h2>
      <span className="mt-3 block h-[3px] w-9 bg-[#FCE500]" />
    </div>
  );
}
