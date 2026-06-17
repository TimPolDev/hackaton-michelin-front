'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/api';
import type { Tire, TireVariant } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BIKE_TYPE_OPTIONS = [
  { value: '', label: 'Tous les vélos' },
  { value: 'ROAD', label: 'Route' },
  { value: 'MTB', label: 'VTT' },
  { value: 'GRAVEL', label: 'Gravel' },
  { value: 'COMMUTING & TOUR', label: 'Ville / Tourisme' },
  { value: 'E-BIKE', label: 'E-bike' },
];

const USE_CASE_OPTIONS = [
  { value: '', label: 'Tous les usages' },
  { value: 'RACING', label: 'Compétition' },
  { value: 'ENDURANCE', label: 'Endurance' },
  { value: 'TOURING', label: 'Randonnée' },
  { value: 'LEISURE', label: 'Loisir' },
];

const TERRAIN_OPTIONS = [
  { value: '', label: 'Tous les terrains' },
  { value: 'ASPHALT', label: 'Asphalte' },
  { value: 'OFFROAD', label: 'Tout-terrain' },
  { value: 'MIXED', label: 'Mixte' },
];

const selectClass =
  'rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-michelin-blue-dark';

function splitTags(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// Bike-type tags without the E-BIKE entry (shown separately via the E-bike badge).
function bikeTypeTags(value?: string): string[] {
  return splitTags(value).filter((t) => t.toUpperCase() !== 'E-BIKE');
}

/** Format a numeric range (min–max) with a unit, collapsing equal bounds. */
function range(values: (number | null | undefined)[], unit: string): string | null {
  const nums = values.filter((v): v is number => typeof v === 'number');
  if (nums.length === 0) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? `${min} ${unit}` : `${min}–${max} ${unit}`;
}

function sizeRange(variants: TireVariant[]): string | null {
  return range(variants.map((v) => v.widthMm), 'mm');
}

function weightRange(variants: TireVariant[]): string | null {
  return range(variants.map((v) => v.weight), 'g');
}

export default function TiresPage() {
  const router = useRouter();
  const [tires, setTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bikeType, setBikeType] = useState('');
  const [useCase, setUseCase] = useState('');
  const [terrainType, setTerrainType] = useState('');

  useEffect(() => {
    const loadTires = async () => {
      setLoading(true);
      try {
        const data = await backend.tires.list({
          search: search.trim() || undefined,
          bikeType: bikeType || undefined,
          useCase: useCase || undefined,
          terrainType: terrainType || undefined,
        });
        setTires(data.tires || []);
      } catch (error) {
        console.error('Error loading tires:', error);
        setTires([]);
      } finally {
        setLoading(false);
      }
    };

    loadTires();
  }, [search, bikeType, useCase, terrainType]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Catalogue de Pneus Michelin</h2>
          <p className="text-muted-foreground">
            Parcourez la gamme de pneus et trouvez le modèle adapté à votre pratique
          </p>
        </div>

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
          <select value={useCase} onChange={(e) => setUseCase(e.target.value)} className={selectClass}>
            {USE_CASE_OPTIONS.map((o) => (
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
            {tires.map((tire) => {
              const size = sizeRange(tire.variants);
              const weight = weightRange(tire.variants);
              return (
                <Card
                  key={tire.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/tires/${tire.id}`)}
                >
                  <CardHeader>
                    <CardTitle>{tire.rangeName}</CardTitle>
                    <CardDescription>{tire.segment}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Types de vélo compatibles */}
                    {(bikeTypeTags(tire.compatibleBikeTypes).length > 0 || tire.isEBikeReady) && (
                      <div className="flex flex-wrap gap-1.5">
                        {bikeTypeTags(tire.compatibleBikeTypes).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-michelin-blue-dark"
                          >
                            {tag}
                          </span>
                        ))}
                        {tire.isEBikeReady && (
                          <span className="rounded-full bg-michelin-yellow px-2 py-0.5 text-xs font-semibold text-michelin-blue-dark">
                            E-bike
                          </span>
                        )}
                      </div>
                    )}

                    {/* Plages agrégées sur les variantes */}
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {size && (
                        <div className="flex justify-between">
                          <span>Largeurs</span>
                          <span className="font-medium text-foreground">{size}</span>
                        </div>
                      )}
                      {weight && (
                        <div className="flex justify-between">
                          <span>Poids</span>
                          <span className="font-medium text-foreground">{weight}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Déclinaisons</span>
                        <span className="font-medium text-foreground">
                          {tire.variants.length} variante{tire.variants.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
