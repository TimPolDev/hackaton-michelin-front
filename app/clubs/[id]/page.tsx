'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { backend } from '@/lib/api';
import {
  MapPin,
  Star,
  Settings,
  Plus,
  Check,
  Users,
  ArrowRight,
  ChevronRight,
  Mountain,
  Bike,
  Map as MapIcon,
} from 'lucide-react';

/* ------------------------------ Types ------------------------------ */

interface LeaderboardEntry {
  cyclistName: string;
  distance: number;
  elevation: number;
}

interface Stats {
  totalDistance: number;
  totalElevation: number;
  activityCount: number;
  leaderboard: LeaderboardEntry[];
}

interface Club {
  id: string;
  name: string;
  description: string;
  bikeTypes: string[] | null;
  inviteCode: string;
  createdAt: string;
  memberCount?: number;
  stats?: Stats;
}

/* ----------------------------- Helpers ----------------------------- */

const BIKE_LABELS: Record<string, string> = {
  ROAD: 'Route',
  GRAVEL: 'Gravel',
  MTB: 'VTT',
  E_BIKE: 'Vélo électrique',
  COMMUTING: 'Ville',
};

const PALETTE = ['#27509B', '#2E7D32', '#9C4221', '#6B21A8', '#1E3A5F', '#B45309'];

function getInitials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFromName(name?: string | null): string {
  const safe = name ?? '';
  let hash = 0;
  for (let i = 0; i < safe.length; i++) hash = safe.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR');

/* -------------------------------------------------------------------- *
 * Données statiques de démo. TODO(back) : remplacer dès que les routes  *
 * correspondantes existent (cf. commentaires sur chaque bloc).          *
 * -------------------------------------------------------------------- */

type Discipline = 'ROUTE' | 'GRAVEL' | 'COMPÉTITION';

// TODO(back): aucun endpoint "fil d'activité du club" (GET /clubs/:id/feed).
const FEED_FALLBACK = [
  {
    name: 'Thomas M.',
    time: 'Il y a 2h',
    tag: 'ROUTE' as Discipline,
    action: 'A complété ',
    title: 'Col de la Croix de Fer — 87 km',
    subtitle: 'Départ Col Bayard · D+ 2 100 m',
    metrics: [
      { value: '87 km', label: 'Distance' },
      { value: '2 100 m', label: 'Dénivelé' },
      { value: '3h 42', label: 'Durée' },
      { value: '23,5 km/h', label: 'Moy.' },
    ],
  },
  {
    name: 'Lucie V.',
    time: 'Il y a 5h',
    tag: 'GRAVEL' as Discipline,
    action: 'A partagé un nouvel itinéraire : ',
    title: 'Beaujolais Gravel — Boucle des Pierres Dorées',
    subtitle: '80 km · Terrain mixte · Niveau intermédiaire',
    metrics: [
      { value: '80 km', label: 'Distance' },
      { value: '1 200 m', label: 'Dénivelé' },
      { value: '62%', label: 'Gravel' },
    ],
  },
  {
    name: 'Jules B.',
    time: 'Hier',
    tag: 'ROUTE' as Discipline,
    action: 'A complété ',
    title: 'Sortie matinale — Monts du Lyonnais',
    subtitle: 'Départ Brignais · Boucle classique',
    metrics: [
      { value: '54 km', label: 'Distance' },
      { value: '820 m', label: 'Dénivelé' },
      { value: '2h 10', label: 'Durée' },
    ],
  },
  {
    name: 'Sarah R.',
    time: 'Il y a 2 jours',
    tag: 'GRAVEL' as Discipline,
    action: "A rejoint l'événement ",
    title: 'Beaujolais Gravel — 21 juin',
    subtitle: '14 participants confirmés',
    metrics: [] as { value: string; label: string }[],
  },
];

// TODO(back): aucun endpoint "événements / sorties du club" (GET /clubs/:id/events).
const EVENTS_FALLBACK = [
  {
    day: '21',
    month: 'Juin',
    title: 'Beaujolais Gravel — 80 km',
    detail: 'Départ Anse · D+ 1 200 m · Intermédiaire',
    tag: 'GRAVEL' as Discipline,
    participants: '14 participants confirmés',
    cta: 'Inscrit',
    joined: true,
  },
  {
    day: '28',
    month: 'Juin',
    title: 'Critérium de la Dombe',
    detail: 'Course officielle · Licence requise',
    tag: 'COMPÉTITION' as Discipline,
    participants: '6 participants',
    cta: 'Rejoindre',
    joined: false,
  },
  {
    day: '5',
    month: 'Juil',
    title: 'Sortie découverte Pilat',
    detail: 'Niveau tout public · 45 km',
    tag: 'ROUTE' as Discipline,
    participants: '3 participants',
    cta: 'Rejoindre',
    joined: false,
  },
];

// TODO(back): aucun endpoint "membres proches du renouvellement" (recommandations pneus par club).
const RENEWAL_FALLBACK = [
  { name: 'Thomas M.', km: '2 840 km', pct: 95 },
  { name: 'Lucie V.', km: '2 310 km', pct: 77 },
  { name: 'Jules B.', km: '1 980 km', pct: 66 },
];

// TODO(back): aucun endpoint "itinéraires du club" (GET /clubs/:id/routes).
const ROUTES_FALLBACK = [
  { title: 'Beaujolais Gravel', detail: '80 km · D+ 1 200 m · 14 fois réalisé', tag: 'GRAVEL' as Discipline, icon: MapIcon, bg: '#DDEFE0' },
  { title: 'Monts du Lyonnais Classic', detail: '54 km · D+ 820 m · 22 fois réalisé', tag: 'ROUTE' as Discipline, icon: Bike, bg: '#E2EAF6' },
  { title: 'Col de la Croix de Fer', detail: '87 km · D+ 2 100 m · 8 fois réalisé', tag: 'ROUTE' as Discipline, icon: Mountain, bg: '#F3E6D2' },
];

const TABS = ['Feed', 'Classement', 'Itinéraires', 'Calendrier', 'Membres'];

/* ------------------------------- UI -------------------------------- */

function Avatar({ name, size = 36 }: { name?: string | null; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, backgroundColor: colorFromName(name), fontSize: size * 0.34 }}
    >
      {getInitials(name)}
    </div>
  );
}

function Tag({ kind }: { kind: Discipline }) {
  const styles: Record<Discipline, string> = {
    ROUTE: 'bg-[#E2EAF6] text-[#27509B]',
    GRAVEL: 'bg-[#DDEFE0] text-[#2E7D32]',
    COMPÉTITION: 'bg-[#FCE9CF] text-[#B45309]',
  };
  return (
    <span className={`rounded px-2 py-[3px] text-[10px] font-bold uppercase tracking-wider ${styles[kind]}`}>
      {kind}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3.5 w-1 rounded-full bg-[#FCE500]" />
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#111]">{children}</h2>
    </div>
  );
}

function CardLink({ children }: { children: React.ReactNode }) {
  return (
    <button className="flex items-center gap-1 text-[12px] font-semibold text-[#27509B] hover:underline">
      {children} <ArrowRight className="h-3 w-3" />
    </button>
  );
}

/* ------------------------------ Page ------------------------------- */

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params?.id as string;

  const [club, setClub] = useState<Club | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('Feed');

  useEffect(() => {
    if (!clubId) return;
    loadClubData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      // GET /clubs/:id renvoie déjà { ...club, memberCount, stats } : pas d'appel séparé.
      const [clubData, cyclistData] = await Promise.all([
        backend.clubs.get(clubId),
        backend.cyclists.me(),
      ]);

      setClub(clubData);
      setStats(clubData.stats ?? null);

      const membership = cyclistData.clubMemberships?.find((m: any) => m.club.id === clubId);
      setIsManager(membership?.isManager || false);
    } catch (error) {
      console.error('Error loading club:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!club) return;
    const inviteLink = `${window.location.origin}/clubs/join/${club.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F4F4F2]">Chargement...</div>;
  }

  if (!club) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F2]">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Club introuvable</h2>
          <button
            className="rounded bg-[#27509B] px-4 py-2 text-sm font-semibold text-white"
            onClick={() => router.push('/clubs')}
          >
            Retour aux clubs
          </button>
        </div>
      </div>
    );
  }

  // ---- Valeurs dérivées du back ----
  const foundedYear = club.createdAt ? new Date(club.createdAt).getFullYear() : null;
  const bikeLabel = (club.bikeTypes ?? [])
    .map((t) => BIKE_LABELS[t] ?? t)
    .join(' & ');
  const memberCount = club.memberCount ?? stats?.leaderboard?.length ?? 0;
  const activityCount = stats?.activityCount ?? 0;
  const avgElevation = stats && activityCount > 0 ? Math.round(stats.totalElevation / activityCount) : 0;
  const maxKm = stats?.leaderboard?.[0]?.distance ?? 1;

  // Barre de stats : 3 valeurs réelles + 2 dérivées/statiques (TODO back pour "événements").
  const STAT_CARDS = [
    { value: fmt(stats?.totalDistance ?? 0), unit: 'km', label: 'Total club ce mois', delta: '▲ +18% vs juin' },
    { value: String(memberCount), label: 'Membres actifs', delta: '▲ +3 ce mois' },
    { value: String(activityCount), label: 'Sorties ce mois', delta: '▲ régulier' },
    // TODO(back): pas d'endpoint événements -> valeur statique.
    { value: '8', label: 'Événements à venir', delta: 'Prochain : sam.' },
    { value: fmt(avgElevation), unit: 'm', label: 'D+ moyen / sortie', delta: '✓ +12%' },
  ];

  const hasRealLeaderboard = !!stats?.leaderboard && stats.leaderboard.length > 0;

  return (
    <main className="min-h-screen bg-[#F4F4F2]">
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-[#27509B]">
        <div className="pointer-events-none absolute -right-24 top-10 h-[360px] w-[360px] rounded-full bg-white/[0.04]" />

        <div className="relative z-10 mx-auto max-w-[1240px] px-6 pt-10 md:px-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="flex flex-col gap-2.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FCE500]">Club actif</p>
              <h1 className="text-4xl font-extrabold italic leading-none text-white md:text-5xl">{club.name}</h1>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-white/65">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#FCE500]" />
                  {/* TODO(back): pas de champ localisation sur le club. */}
                  France
                </span>
                {foundedYear && (
                  <>
                    <span>·</span>
                    <span>Fondé en {foundedYear}</span>
                  </>
                )}
                {bikeLabel && (
                  <>
                    <span>·</span>
                    <span>{bikeLabel}</span>
                  </>
                )}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                {/* TODO(back): pas de champ "premium" / "partenaire" -> badges statiques. */}
                <span className="flex items-center gap-1 rounded bg-[#FCE500] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#000C34]">
                  <Star className="h-3 w-3 fill-[#000C34]" /> Club Premium
                </span>
                <span className="rounded border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {memberCount} Membres
                </span>
                <span className="rounded border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  Michelin Partner
                </span>
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              {isManager && (
                <button className="flex items-center gap-2 rounded border border-white/30 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/10">
                  <Settings className="h-4 w-4" /> Gérer le club
                </button>
              )}
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-2 rounded bg-[#FCE500] px-4 py-2.5 text-[13px] font-bold text-[#000C34] transition hover:bg-[#e6d100]"
              >
                {inviteCopied ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {inviteCopied ? 'Lien copié !' : 'Inviter un membre'}
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-8 grid grid-cols-2 divide-white/10 rounded-t-lg border border-white/10 bg-white/[0.04] sm:grid-cols-3 md:grid-cols-5 md:divide-x">
            {STAT_CARDS.map((s) => (
              <div key={s.label} className="px-6 py-5 text-center">
                <div className="leading-none">
                  <span className="text-3xl font-extrabold italic text-[#FCE500]">{s.value}</span>
                  {s.unit && <span className="ml-1 text-xs font-semibold italic text-white/50">{s.unit}</span>}
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-wider text-white/45">{s.label}</p>
                <p className="mt-1 text-[10px] font-semibold text-[#FCE500]">{s.delta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== TABS ===================== */}
      <div className="border-b border-[#E5E5E0] bg-white">
        <div className="mx-auto max-w-[1240px] px-6 md:px-16">
          <nav className="flex gap-7">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-4 text-[13px] font-semibold transition ${
                  activeTab === tab ? 'text-[#27509B]' : 'text-[#777] hover:text-[#111]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#27509B]" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ===================== CONTENT ===================== */}
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 px-6 py-8 md:px-16 lg:grid-cols-[1fr_360px]">
        {/* -------- Left column -------- */}
        <div className="flex flex-col gap-6">
          {/* Activité récente — TODO(back): pas d'endpoint feed, données statiques. */}
          <section className="rounded-lg border border-[#E8E8E3] bg-white p-6">
            <div className="flex items-center justify-between">
              <SectionHeading>Activité récente</SectionHeading>
              <CardLink>Voir tout</CardLink>
            </div>

            <div className="mt-4 flex flex-col">
              {FEED_FALLBACK.map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-3 py-4 ${i < FEED_FALLBACK.length - 1 ? 'border-b border-[#F0F0EC]' : ''}`}
                >
                  <Avatar name={item.name} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold text-[#111]">{item.name}</span>
                      <span className="text-[12px] text-[#999]">{item.time}</span>
                      <Tag kind={item.tag} />
                    </div>
                    <p className="mt-2 text-[14px] text-[#333]">
                      {item.action}
                      <span className="font-bold text-[#111]">{item.title}</span>
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#777]">{item.subtitle}</p>

                    {item.metrics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                        {item.metrics.map((m) => (
                          <div key={m.label}>
                            <div className="text-[14px] font-bold italic text-[#27509B]">{m.value}</div>
                            <div className="text-[10px] uppercase tracking-wider text-[#999]">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Classement du mois — données réelles (stats.leaderboard). */}
          <section className="rounded-lg border border-[#E8E8E3] bg-white p-6">
            <div className="flex items-center justify-between">
              <SectionHeading>Classement du mois</SectionHeading>
              <CardLink>Classement complet</CardLink>
            </div>

            {hasRealLeaderboard ? (
              <div className="mt-5 flex flex-col gap-4">
                {stats!.leaderboard.map((row, i) => (
                  <div key={`${row.cyclistName}-${i}`} className="flex items-center gap-3">
                    <span className="w-4 text-center text-[13px] font-bold text-[#999]">{i + 1}</span>
                    <Avatar name={row.cyclistName} size={34} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-[#111]">{row.cyclistName ?? 'Cycliste'}</span>
                        <span className="text-[14px] font-bold text-[#111]">
                          {fmt(row.distance)} <span className="text-[11px] font-normal text-[#999]">km</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-[#999]">{fmt(row.elevation)} m D+</p>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#F0F0EC]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(4, (row.distance / maxKm) * 100)}%`,
                            backgroundColor: i === 0 ? '#FCE500' : '#27509B',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-[13px] text-[#999]">Aucune activité pour le moment.</p>
            )}
          </section>
        </div>

        {/* -------- Right sidebar -------- */}
        <aside className="flex flex-col gap-6">
          {/* Prochaines sorties — TODO(back): pas d'endpoint événements, données statiques. */}
          <section className="rounded-lg border border-[#E8E8E3] bg-white p-5">
            <div className="flex items-center justify-between">
              <SectionHeading>Prochaines sorties</SectionHeading>
              <CardLink>Calendrier</CardLink>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {EVENTS_FALLBACK.map((ev) => (
                <div key={ev.title} className="rounded-lg border border-[#EDEDE8] p-3">
                  <div className="flex gap-3">
                    <div className="flex w-10 shrink-0 flex-col items-center justify-center">
                      <span className="text-xl font-extrabold leading-none text-[#27509B]">{ev.day}</span>
                      <span className="text-[10px] uppercase tracking-wide text-[#999]">{ev.month}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-bold leading-snug text-[#111]">{ev.title}</p>
                        <button
                          className={`shrink-0 whitespace-nowrap rounded px-2.5 py-1 text-[11px] font-semibold ${
                            ev.joined
                              ? 'border border-[#27509B] text-[#27509B]'
                              : 'bg-[#27509B] text-white hover:bg-[#1e3f7a]'
                          }`}
                        >
                          {ev.joined && <Check className="mr-1 inline h-3 w-3" />}
                          {ev.cta}
                        </button>
                      </div>
                      <p className="mt-1 text-[12px] text-[#777]">{ev.detail}</p>
                      <div className="mt-2">
                        <Tag kind={ev.tag} />
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-[11px] text-[#999]">
                        <Users className="h-3 w-3" /> {ev.participants}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Michelin — TODO(back): pas d'endpoint "renouvellement par club". */}
          <section className="rounded-lg border border-[#CFE0F5] bg-[#EAF1FB] p-5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#27509B] px-2 py-0.5 text-[11px] font-extrabold italic text-[#FCE500]">
                Michelin
              </span>
              <h2 className="text-[13px] font-bold text-[#111]">Membres proches du renouvellement</h2>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-[#555]">
              3 membres de votre club approchent des 3 000 km ce mois. Un bon moment pour penser aux pneus.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {RENEWAL_FALLBACK.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <Avatar name={m.name} size={28} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#111]">{m.name}</span>
                      <span className="text-[12px] font-bold text-[#111]">{m.km}</span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-[#E8743B]" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded bg-[#27509B] py-2.5 text-[12px] font-bold uppercase tracking-wide text-white transition hover:bg-[#1e3f7a]">
              Voir les recommandations <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </section>

          {/* Itinéraires du club — TODO(back): pas d'endpoint, données statiques. */}
          <section className="rounded-lg border border-[#E8E8E3] bg-white p-5">
            <div className="flex items-center justify-between">
              <SectionHeading>Itinéraires du club</SectionHeading>
              <CardLink>Voir tout</CardLink>
            </div>

            <div className="mt-4 flex flex-col">
              {ROUTES_FALLBACK.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.title}
                    className={`flex items-center gap-3 py-3 ${i < ROUTES_FALLBACK.length - 1 ? 'border-b border-[#F0F0EC]' : ''}`}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: r.bg }}
                    >
                      <Icon className="h-5 w-5 text-[#27509B]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-[#111]">{r.title}</p>
                      <p className="text-[11px] text-[#999]">{r.detail}</p>
                      <div className="mt-1.5">
                        <Tag kind={r.tag} />
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[#CCC]" />
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
