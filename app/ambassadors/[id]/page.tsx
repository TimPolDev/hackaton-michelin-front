'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AmbassadorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ambassadorId = params.id as string;

  const [ambassador, setAmbassador] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAmbassador = async () => {
      try {
        const res = await api.get(`/ambassadors/${ambassadorId}`);
        setAmbassador(res.data);
      } catch (error) {
        console.error('Error loading ambassador:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAmbassador();
  }, [ambassadorId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!ambassador) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ambassadeur introuvable</h2>
          <Button onClick={() => router.push('/ambassadors')}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.push('/ambassadors')}>
          ← Ambassadeurs
        </Button>
        {/* En-tête avec photo principale */}
        <Card className="mb-6 overflow-hidden">
          {ambassador.photoUrl && (
            <div className="w-full h-80 overflow-hidden">
              <img
                src={ambassador.photoUrl}
                alt={ambassador.cyclist.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-3xl">{ambassador.cyclist.fullName}</CardTitle>
            <CardDescription className="text-lg">
              {ambassador.discipline} - {ambassador.skillLevel}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-base leading-relaxed">{ambassador.bio}</p>

            {ambassador.stats && (
              <div className="bg-blue-50 p-4 rounded-md mt-6">
                <h3 className="font-semibold mb-3">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Distance mensuelle</span>
                    <p className="font-bold text-lg">{ambassador.stats.monthlyDistance} km</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Dénivelé total</span>
                    <p className="font-bold text-lg">{ambassador.stats.totalElevation} m</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Galerie photos */}
        {ambassador.photos && ambassador.photos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Galerie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ambassador.photos.map((photoUrl: string, index: number) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={photoUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Article */}
        {ambassador.articleContent && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>À propos</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: ambassador.articleContent }}
              />
            </CardContent>
          </Card>
        )}

        {/* Segments remarquables */}
        {ambassador.featuredSegments && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Performances notables</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">{ambassador.featuredSegments}</p>
            </CardContent>
          </Card>
        )}

        {/* Pneus recommandés */}
        {ambassador.tires && ambassador.tires.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pneus Michelin utilisés</CardTitle>
              <CardDescription>
                Les pneus que {ambassador.cyclist.fullName} utilise et recommande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {ambassador.tires.map((tireInfo: any) => (
                  <div key={tireInfo.bikeType} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {tireInfo.bikeType}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{tireInfo.tire.rangeName}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {tireInfo.tire.webProductName}
                        </p>
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-sm">
                          "{tireInfo.testimonial}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push('/ambassadors')}>
            ← Retour aux ambassadeurs
          </Button>
        </div>
      </div>
    </div>
  );
}
