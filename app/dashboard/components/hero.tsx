export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#27509B] px-5 pt-5 pb-10">
      {/* Cercle décoratif */}
      <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-yellow-300/5" />

      <div className="relative z-10">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#FCE500]">
          Bonjour 👋
        </p>

        <h1 className="mb-1 text-3xl font-extrabold italic text-white">
          Thomas M.
        </h1>

        <p className="text-sm text-white/55">
          Dernière sortie il y a 2 jours · 47 km
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <StatCard
            value="847"
            unit="km"
            label="Ce mois"
            delta="▲ +18%"
          />

          <StatCard
            value="12"
            label="Sorties"
            delta="▲ +2"
          />

          <StatCard
            value="3"
            label="Clubs"
            delta="↗ actifs"
          />
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

function StatCard({
  value,
  unit,
  label,
  delta,
}: StatCardProps) {
  return (
    <div className="rounded border border-white/10 bg-white/10 px-2.5 py-3 text-center backdrop-blur-sm">
      <div className="leading-none">
        <span className="text-2xl font-extrabold italic text-[#FCE500]">
          {value}
        </span>

        {unit && (
          <span className="ml-1 text-[10px] font-semibold text-white/60">
            {unit}
          </span>
        )}
      </div>

      <p className="mt-1 text-[9px] uppercase tracking-wider text-white/40">
        {label}
      </p>

      <p className="mt-1 text-[9px] font-semibold text-[#FCE500]">
        {delta}
      </p>
    </div>
  );
}