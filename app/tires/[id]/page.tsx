'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { backend } from '@/lib/api';
import type { Tire } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

function fmtSize(widthMm?: number | null, diameterMm?: number | null): string {
  if (widthMm && diameterMm) return `${widthMm} × ${diameterMm} mm`;
  if (widthMm) return `${widthMm} mm`;
  if (diameterMm) return `${diameterMm} mm`;
  return '—';
}

function fmtPressure(min?: number | null, max?: number | null): string {
  if (min != null && max != null) return `${min}–${max} bar`;
  if (max != null) return `≤ ${max} bar`;
  if (min != null) return `≥ ${min} bar`;
  return '—';
}

export default function TireDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tireId = params.id as string;

  const [tire, setTire] = useState<Tire | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTire = async () => {
      setLoading(true);
      try {
        const data = await backend.tires.get(tireId);
        setTire(data);
      } catch (error) {
        console.error('Error loading tire:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTire();
  }, [tireId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!tire) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Pneu introuvable</p>
        <Button variant="outline" onClick={() => router.push('/tires')}>
          Retour au catalogue
        </Button>
      </div>
    );
  }

  const techs = [
    ['Gomme', tire.rubberTech],
    ['Carcasse', tire.casingTech],
    ['Sculpture', tire.treadPatternTech],
    ['Flanc', tire.sidewallType],
    ['Étanchéité', tire.sealing],
    ['Jante', tire.rimType],
    ['Montage', tire.fitting],
  ].filter(([, v]) => Boolean(v)) as [string, string][];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" className="mb-6" onClick={() => router.push('/tires')}>
          ← Catalogue
        </Button>

        {/* En-tête produit */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{tire.rangeName}</CardTitle>
            <p className="text-muted-foreground">
              {tire.brand} · {tire.segment} · {tire.productType}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {tire.useCases && (
              <p className="text-sm">
                <span className="text-muted-foreground">Usages : </span>
                {splitTags(tire.useCases).join(', ')}
              </p>
            )}

            {techs.length > 0 && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                {techs.map(([label, value]) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau des variantes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Variantes ({tire.variants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Désignation</th>
                    <th className="py-2 pr-4 font-medium">Taille</th>
                    <th className="py-2 pr-4 font-medium">Poids</th>
                    <th className="py-2 pr-4 font-medium">Pression</th>
                    <th className="py-2 pr-4 font-medium">Terrain</th>
                    <th className="py-2 pr-4 font-medium">EAN</th>
                  </tr>
                </thead>
                <tbody>
                  {tire.variants.map((v) => (
                    <tr key={v.id} className="border-b last:border-0 align-top">
                      <td className="py-2 pr-4">
                        <div className="font-medium text-foreground">{v.webProductName}</div>
                        <div className="text-xs text-muted-foreground">{v.designation}</div>
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">{fmtSize(v.widthMm, v.diameterMm)}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{v.weight != null ? `${v.weight} g` : '—'}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{fmtPressure(v.minPressure, v.maxPressure)}</td>
                      <td className="py-2 pr-4">{v.terrainTypes || '—'}</td>
                      <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                        {v.eanCode || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
