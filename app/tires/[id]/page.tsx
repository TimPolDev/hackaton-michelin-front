'use client';

import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Reseller, Tire, TireVariant } from '@/lib/api';
import { backend } from '@/lib/api';
import { TireTags, bikeTypeTags, splitTags } from '@/components/tires/TireTags';
import { TireCard } from '@/components/tires/TireCard';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function fmtPressure(min?: number | null, max?: number | null): string {
  if (min != null && max != null) return `${min}–${max} bar`;
  if (max != null) return `≤ ${max} bar`;
  if (min != null) return `≥ ${min} bar`;
  return '—';
}

// Dimension : valeur en mm si dispo, sinon ETRTO seul.
function fmtDimension(mm?: number | null, etrto?: string | null): string {
  if (mm != null) return `${mm} mm`;
  return etrto || '—';
}

// Specs d'une variante, partagées entre le tableau (desktop) et les cartes (mobile).
const VARIANT_SPEC_LABELS = [
  'Largeur',
  'Diamètre',
  'Poids',
  'Pression',
  'Couleur flanc',
  'Couleur sculpture',
];

function variantSpecValues(v: TireVariant): string[] {
  return [
    fmtDimension(v.widthMm, v.widthEtrto),
    fmtDimension(v.diameterMm, v.diameterEtrto),
    v.weight != null ? `${v.weight} g` : '—',
    fmtPressure(v.minPressure, v.maxPressure),
    v.sidewallColor || '—',
    v.treadPatternColor || '—',
  ];
}

// Nombre de revendeurs affichés avant le bouton « Voir plus ».
const RESELLERS_PREVIEW = 3;

// Palette pour les pastilles revendeurs (couleur déterministe par nom).
const RESELLER_COLORS = [
  'bg-michelin-blue-dark',
  'bg-emerald-600',
  'bg-orange-500',
  'bg-purple-600',
  'bg-rose-500',
  'bg-cyan-600',
];

// Initiales + couleur stable dérivées du nom du revendeur, pour la pastille.
function resellerBadge(name: string): { initials: string; color: string } {
  const initials = name
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return { initials: initials || '?', color: RESELLER_COLORS[hash % RESELLER_COLORS.length] };
}

// Revendeurs français en premier, puis ordre alphabétique.
function orderResellers(resellers: Reseller[]): Reseller[] {
  return [...resellers].sort((a, b) => {
    if (a.country !== b.country) {
      if (a.country === 'FR') return -1;
      if (b.country === 'FR') return 1;
    }
    return a.name.localeCompare(b.name);
  });
}

// Pays de l'utilisateur. Codé en dur sur la France pour le moment : la vraie
// détection (profil / géoloc) sera branchée plus tard.
const USER_COUNTRY = 'FR';

// Product gallery: main image + thumbnails, placeholder when empty.
function TireGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 sm:h-72 lg:h-80">
        <svg viewBox="0 0 24 24" className="h-20 w-20 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      </div>
    );
  }

  const current = Math.min(active, images.length - 1);

  return (
    <div className="space-y-3">
      <img
        src={images[current]}
        alt={alt}
        className="h-64 w-full rounded-lg bg-gray-50 object-contain sm:h-72 lg:h-80"
      />
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={`h-14 w-14 overflow-hidden rounded-md border-2 sm:h-16 sm:w-16 ${
                i === current ? 'border-michelin-blue-dark' : 'border-transparent'
              }`}
            >
              <img src={img} alt={`${alt} ${i + 1}`} className="h-full w-full bg-gray-50 object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Pneus similaires : on élargit progressivement la requête (même gamme + type de
// vélo, puis gamme seule, puis type de vélo seul) jusqu'à réunir assez de candidats.
const SIMILAR_COUNT = 3;

async function fetchSimilarTires(current: Tire): Promise<Tire[]> {
  const primaryBike = bikeTypeTags(current.compatibleBikeTypes)[0];
  const segment = current.segment || undefined;
  const queries = [
    { segment, bikeType: primaryBike },
    { segment },
    { bikeType: primaryBike },
  ];

  const seen = new Set<string>([current.id]);
  const out: Tire[] = [];
  for (const q of queries) {
    if (out.length >= SIMILAR_COUNT) break;
    if (!q.segment && !q.bikeType) continue;
    const data = await backend.tires.list({ ...q, limit: 12 });
    for (const t of data.tires ?? []) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      out.push(t);
      if (out.length >= SIMILAR_COUNT) break;
    }
  }
  return out;
}

export default function TireDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tireId = params.id as string;

  const [tire, setTire] = useState<Tire | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [similar, setSimilar] = useState<Tire[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [showAllResellers, setShowAllResellers] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadTire = async () => {
      setLoading(true);
      setSimilar([]);
      try {
        const data = await backend.tires.get(tireId);
        if (cancelled) return;
        setTire(data);
        setSelectedVariantId(null);
        try {
          const sim = await fetchSimilarTires(data);
          if (!cancelled) setSimilar(sim);
        } catch (error) {
          console.error('Error loading similar tires:', error);
        }
      } catch (error) {
        console.error('Error loading tire:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTire();
    return () => {
      cancelled = true;
    };
  }, [tireId]);

  // Revendeurs (indépendants du pneu) — chargés une fois, restreints à la
  // région de l'utilisateur (déduite de son pays). Si cette région n'a aucun
  // revendeur, on n'affiche rien.
  useEffect(() => {
    let cancelled = false;
    backend.resellers
      .list()
      .then((all) => {
        if (cancelled) return;
        const userRegion = all.find((r) => r.country === USER_COUNTRY)?.region;
        const scoped = userRegion
          ? all.filter((r) => r.region === userRegion)
          : [];
        setResellers(orderResellers(scoped));
      })
      .catch((error) => console.error('Error loading resellers:', error));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <PageLoader label="Chargement du pneu..." />;
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

  // Caractéristiques produit retenues (champs vides masqués).
  const characteristics = (
    [
      ['Gomme', tire.rubberTech],
      ['Carcasse', tire.casingTech],
      ['Flanc', tire.sidewallType],
      ['Étanchéité', tire.sealing],
      ['Jante', tire.rimType],
      ['Montage', tire.fitting],
    ] as [string, string | null | undefined][]
  ).filter(([, v]) => Boolean(v));

  const selectedVariant: TireVariant | undefined = tire.variants.find(
    (v) => v.id === selectedVariantId,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Button variant="outline" className="mb-6" onClick={() => router.push('/tires')}>
          ← Catalogue
        </Button>

        {/* Rangée 1 : galerie + infos. Cartes étirées à la même hauteur (stretch). */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Galerie produit */}
          <Card>
            <CardContent className="pt-6">
              <TireGallery images={tire.images} alt={tire.rangeName} />
            </CardContent>
          </Card>

          {/* En-tête produit + caractéristiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">{tire.rangeName}</CardTitle>
              <p className="text-muted-foreground">
                {tire.brand} · {tire.segment} · {tire.productType}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
            <TireTags
              compatibleBikeTypes={tire.compatibleBikeTypes}
              terrainTypes={tire.terrainTypes}
              isEBikeReady={tire.isEBikeReady}
            />

            {tire.useCases && (
              <p className="text-sm">
                <span className="text-muted-foreground">Usages : </span>
                {splitTags(tire.useCases).join(', ')}
              </p>
            )}

            {characteristics.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="mb-3 text-lg font-semibold">Caractéristiques</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                  {characteristics.map(([label, value]) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* Rangée 2 : variantes + « Où acheter ». Cartes étirées à la même hauteur. */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Choix de la variante */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Choisir une variante ({tire.variants.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop : tableau */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-3 font-medium" aria-label="Sélection" />
                      <th className="py-2 pr-3 font-medium">Désignation</th>
                      {VARIANT_SPEC_LABELS.map((label) => (
                        <th key={label} className="py-2 pr-3 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tire.variants.map((v) => {
                      const selected = v.id === selectedVariantId;
                      return (
                        <tr
                          key={v.id}
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`cursor-pointer border-b last:border-0 align-top ${
                            selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-2 pr-3">
                            <input
                              type="radio"
                              name="variant"
                              checked={selected}
                              onChange={() => setSelectedVariantId(v.id)}
                              aria-label={`Choisir ${v.webProductName}`}
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <div className="text-xs font-medium text-foreground">{v.webProductName}</div>
                            <div className="text-[11px] text-muted-foreground">{v.designation}</div>
                          </td>
                          {variantSpecValues(v).map((value, i) => (
                            <td key={VARIANT_SPEC_LABELS[i]} className="py-2 pr-3 whitespace-nowrap">
                              {value}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile : une carte cliquable par variante */}
              <div className="space-y-3 md:hidden">
                {tire.variants.map((v) => {
                  const selected = v.id === selectedVariantId;
                  const specs = variantSpecValues(v);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      aria-pressed={selected}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selected ? 'border-michelin-blue-dark bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground">{v.webProductName}</div>
                          <div className="text-xs text-muted-foreground">{v.designation}</div>
                        </div>
                        <input
                          type="radio"
                          name="variant-mobile"
                          checked={selected}
                          onChange={() => setSelectedVariantId(v.id)}
                          aria-label={`Choisir ${v.webProductName}`}
                          className="mt-0.5 shrink-0"
                        />
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        {VARIANT_SPEC_LABELS.map((label, i) =>
                          specs[i] && specs[i] !== '—' ? (
                            <div key={label} className="flex flex-col">
                              <dt className="text-muted-foreground">{label}</dt>
                              <dd className="font-medium">{specs[i]}</dd>
                            </div>
                          ) : null,
                        )}
                      </dl>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Revendeurs partenaires (liens vers leur boutique en ligne) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <span className="inline-block h-4 w-1 rounded bg-michelin-yellow" />
                Où acheter
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resellers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun revendeur disponible pour le moment.
                </p>
              ) : !selectedVariant ? (
                <p className="text-sm text-muted-foreground">
                  Sélectionnez d&apos;abord une variante pour voir les revendeurs.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Variante sélectionnée :{' '}
                    <span className="font-medium text-foreground">
                      {selectedVariant.webProductName}
                    </span>
                  </p>
                  {(showAllResellers
                    ? resellers
                    : resellers.slice(0, RESELLERS_PREVIEW)
                  ).map((r) => {
                    const badge = resellerBadge(r.name);
                    return (
                      <a
                        key={r.id}
                        href={r.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white ${badge.color}`}
                        >
                          {badge.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold">{r.name}</div>
                        </div>
                        <span className="shrink-0 text-sm font-medium text-michelin-blue-dark">
                          Visiter →
                        </span>
                      </a>
                    );
                  })}
                  {resellers.length > RESELLERS_PREVIEW && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowAllResellers((v) => !v)}
                    >
                      {showAllResellers
                        ? 'Voir moins'
                        : `Voir plus (${resellers.length - RESELLERS_PREVIEW})`}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Revendeurs partenaires Michelin. Disponibilité et prix sur leur site.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ambassadeurs qui utilisent ce pneu */}
        {tire.ambassadors && tire.ambassadors.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">Ils roulent avec ce pneu</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tire.ambassadors.map(({ ambassador: amb, testimonial, bikeType }) => (
                <Card
                  key={`${amb.id}-${bikeType}`}
                  className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/ambassadors/${amb.id}`)}
                >
                  <div className="flex items-center gap-4 p-4">
                    {amb.photoUrl ? (
                      <img
                        src={amb.photoUrl}
                        alt={amb.cyclist?.fullName ?? 'Ambassadeur'}
                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-lg font-bold text-gray-400">
                        {(amb.cyclist?.fullName ?? '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{amb.cyclist?.fullName}</p>
                      {(amb.discipline || amb.skillLevel) && (
                        <p className="truncate text-sm text-muted-foreground">
                          {[amb.discipline, amb.skillLevel].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {testimonial && (
                    <CardContent className="pt-0">
                      <p className="line-clamp-3 text-sm italic text-muted-foreground">
                        « {testimonial} »
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Pneus similaires */}
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-bold">Pneus similaires</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <TireCard key={s.id} tire={s} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
