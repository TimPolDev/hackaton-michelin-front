'use client';

import { useEffect, useState } from 'react';
import { backend } from '@/lib/api';

export default function Hero() {
  const [cyclist, setCyclist] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cyclistData, statsData] = await Promise.all([
          backend.cyclists.me(),
          backend.cyclists.stats({ period: 'all' }),
        ]);
        setCyclist(cyclistData);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading hero data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculer le prénom ou initiales
  const getDisplayName = () => {
    if (!cyclist?.fullName) return 'Cycliste';
    const parts = cyclist.fullName.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return parts[0];
  };

  // Formater la dernière sortie
  const getLastActivity = () => {
    if (!stats?.lastActivity) return null;
    const date = new Date(stats.lastActivity.activityDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const distance = Math.round(stats.lastActivity.distance);

    if (diffDays === 0) return `Aujourd'hui · ${distance} km`;
    if (diffDays === 1) return `Hier · ${distance} km`;
    if (diffDays < 7) return `Il y a ${diffDays} jours · ${distance} km`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''} · ${distance} km`;
    }
    return `Il y a ${Math.floor(diffDays / 30)} mois · ${distance} km`;
  };

  // Calculer le nombre de clubs
  const clubsCount = cyclist?.clubMemberships?.length || 0;

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-[#27509B] px-5 pt-5 pb-10">
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-yellow-300/5" />
        <div className="relative z-10">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#FCE500]">
            Chargement...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#27509B] px-5 pt-5 pb-10">
      {/* Cercle décoratif */}
      <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-yellow-300/5" />

      <div className="relative z-10">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#FCE500]">
          Bonjour
        </p>

        <h1 className="mb-1 text-3xl font-extrabold italic text-white">
          {getDisplayName()}
        </h1>

        {getLastActivity() && (
          <p className="text-sm text-white/55">
            Dernière sortie {getLastActivity()}
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          <StatCard
            value={Math.round(stats?.totalDistance || 0).toString()}
            unit="km"
            label="Total"
            delta={stats?.distanceChange ? `${stats.distanceChange > 0 ? '▲' : '▼'} ${stats.distanceChange > 0 ? '+' : ''}${Math.round(stats.distanceChange)}%` : '—'}
          />

          <StatCard
            value={(stats?.activityCount || 0).toString()}
            label="Sorties"
            delta={stats?.activityChange ? `${stats.activityChange > 0 ? '▲' : '▼'} ${stats.activityChange > 0 ? '+' : ''}${stats.activityChange}` : '—'}
          />

          <StatCard
            value={clubsCount.toString()}
            label="Clubs"
            delta={clubsCount > 0 ? 'actifs' : '—'}
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
