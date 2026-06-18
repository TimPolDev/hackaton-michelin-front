'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { backend } from '@/lib/api';
import type { Tire } from '@/lib/api';
import { TireCard } from '@/components/tires/TireCard';

const BIKE_TYPE_OPTIONS = [
  { value: '', label: 'Tous les vélos' },
  { value: 'ROAD', label: 'Route' },
  { value: 'MTB', label: 'VTT' },
  { value: 'GRAVEL', label: 'Gravel' },
  { value: 'COMMUTING & TOUR', label: 'Ville / Tourisme' },
  { value: 'E-BIKE', label: 'E-bike' },
  { value: 'INNER TUBES', label: 'Chambres à air' },
  { value: 'KIDS', label: 'Enfant' },
];

const SEGMENT_OPTIONS = [
  { value: '', label: 'Toutes les gammes' },
  { value: 'PREMIUM COMPETITION LINE', label: 'Compétition' },
  { value: 'PREMIUM RACING LINE', label: 'Racing' },
  { value: 'PREMIUM PERFORMANCE LINE', label: 'Performance' },
  { value: 'ACCESS LINE', label: 'Access' },
];

const TERRAIN_OPTIONS = [
  { value: '', label: 'Tous les terrains' },
  { value: 'ASPHALT', label: 'Asphalte' },
  { value: 'OFFROAD', label: 'Tout-terrain' },
  { value: 'MIXED', label: 'Mixte (route & chemin)' },
];

// Nombre de pneus chargés par batch lors du scroll.
const PAGE_SIZE = 12;

const selectClass =
  'rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-michelin-blue-dark';

export default function TiresPage() {
  const [tires, setTires] = useState<Tire[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); // chargement initial / changement de filtre
  const [loadingMore, setLoadingMore] = useState(false); // chargement d'un batch supplémentaire
  const [search, setSearch] = useState(''); // valeur affichée dans le champ (instantanée)
  const [debouncedSearch, setDebouncedSearch] = useState(''); // valeur utilisée pour la requête
  const [bikeType, setBikeType] = useState('');
  const [segment, setSegment] = useState('');
  const [terrainType, setTerrainType] = useState('');

  // Refs lues par l'IntersectionObserver pour éviter les closures périmées.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tiresRef = useRef<Tire[]>([]);
  const totalRef = useRef(0);
  const loadingRef = useRef(false); // garde anti-chargements concurrents
  tiresRef.current = tires;
  totalRef.current = total;

  const hasMore = tires.length < total;

  // Attend 300 ms après la dernière frappe avant de lancer la recherche.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filtres actifs envoyés à l'API (sans pagination).
  const filterParams = useCallback(
    () => ({
      search: debouncedSearch.trim() || undefined,
      bikeType: bikeType || undefined,
      segment: segment || undefined,
      terrainType: terrainType || undefined,
    }),
    [debouncedSearch, bikeType, segment, terrainType],
  );

  // (Re)charge le premier batch dès qu'un filtre change.
  useEffect(() => {
    let cancelled = false;
    loadingRef.current = true;
    setLoading(true);
    backend.tires
      .list({ ...filterParams(), limit: PAGE_SIZE, offset: 0 })
      .then((data) => {
        if (cancelled) return;
        setTires(data.tires || []);
        setTotal(data.total || 0);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Error loading tires:', error);
        setTires([]);
        setTotal(0);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        loadingRef.current = false;
      });
    return () => {
      cancelled = true;
    };
  }, [filterParams]);

  // Charge le batch suivant (déclenché par le scroll).
  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    if (tiresRef.current.length >= totalRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const data = await backend.tires.list({
        ...filterParams(),
        limit: PAGE_SIZE,
        offset: tiresRef.current.length,
      });
      setTires((prev) => [...prev, ...(data.tires || [])]);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error loading more tires:', error);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [filterParams]);

  // Observe la sentinelle en bas de liste pour déclencher le chargement.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, loading, hasMore]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#27509B] text-white px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold italic mb-1 md:mb-2">Catalogue de Pneus Michelin</h1>
          <p className="text-sm md:text-base text-white/70">Parcourez la gamme de pneus et trouvez le modèle adapté à votre pratique</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un pneu..."
            className="rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-michelin-blue-dark md:flex-1"
          />
          <select value={bikeType} onChange={(e) => setBikeType(e.target.value)} className={selectClass}>
            {BIKE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select value={segment} onChange={(e) => setSegment(e.target.value)} className={selectClass}>
            {SEGMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select value={terrainType} onChange={(e) => setTerrainType(e.target.value)} className={selectClass}>
            {TERRAIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">Chargement...</div>
        ) : tires.length === 0 ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            Aucun pneu trouvé
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tires.map((tire) => (
              <TireCard key={tire.id} tire={tire} />
            ))}
          </div>
        )}

        {/* Sentinelle d'infinite scroll + indicateur de chargement du batch suivant */}
        {!loading && tires.length > 0 && (
          <>
            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            {loadingMore && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Chargement...
              </div>
            )}
            {!hasMore && (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Vous avez vu les {total} pneus du catalogue
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
