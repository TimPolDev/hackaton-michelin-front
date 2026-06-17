export type HeroStats = {
  /** Distance du mois en km. */
  distance?: number | string;
  /** Nombre de sorties. */
  rides?: number | string;
  /** Nombre de clubs actifs. */
  clubs?: number | string;
};

type HeroProps = {
  name?: string;
  lastRide?: string;
  stats?: HeroStats;
};

// Valeurs de repli (maquette Figma) utilisées tant que le back ne renvoie rien.
const FALLBACK = {
  name: 'Thomas M.',
  lastRide: 'Dernière sortie il y a 2 jours · 47 km · Lyon Gravel Riders',
  stats: { distance: '847', rides: '12', clubs: '3' },
};

export default function Hero({ name, lastRide, stats }: HeroProps) {
  const distance = stats?.distance ?? FALLBACK.stats.distance;
  const rides = stats?.rides ?? FALLBACK.stats.rides;
  const clubs = stats?.clubs ?? FALLBACK.stats.clubs;

  return (
    <section className="relative overflow-hidden bg-[#27509B]">
      {/* Cercle décoratif */}
      <div className="absolute -right-[60px] -bottom-[60px] h-[320px] w-[320px] rounded-full bg-[#FCE500]/[0.06]" />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 px-6 py-12 md:flex-row md:items-center md:px-16">
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FCE500]">
            Bonjour 👋
          </p>
          <h1 className="text-4xl font-extrabold italic leading-none text-white">
            {name ?? FALLBACK.name}
          </h1>
          <p className="text-[15px] text-white/55">{lastRide ?? FALLBACK.lastRide}</p>
        </div>

        <div className="flex gap-4">
          {/* delta mocké : pas de comparatif mensuel renvoyé par le back */}
          <StatCard value={String(distance)} unit="km" label="Ce mois" delta="▲ +18% vs juin" />
          <StatCard value={String(rides)} label="Sorties" delta="▲ +2" />
          <StatCard value={String(clubs)} label="Clubs actifs" delta="↗ 1 nouveau" />
        </div>
      </div>
    </section>
  );
}

type StatCardProps = {
  value: string;
  label: string;
  delta: string;
  unit?: string;
};

function StatCard({ value, unit, label, delta }: StatCardProps) {
  return (
    <div className="flex min-w-[120px] flex-col gap-[3px] rounded border border-white/15 bg-white/[0.08] px-6 py-5 text-center backdrop-blur-sm">
      <div className="leading-none">
        <span className="text-4xl font-extrabold italic text-[#FCE500]">{value}</span>
        {unit && (
          <span className="ml-1 text-xs font-semibold italic text-white/50">{unit}</span>
        )}
      </div>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">{label}</p>
      <p className="text-[10px] font-semibold text-[#FCE500]">{delta}</p>
    </div>
  );
}
