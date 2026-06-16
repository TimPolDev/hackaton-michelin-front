'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AmbassadorsPage() {
  const router = useRouter();
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAmbassadors = async () => {
      try {
        const res = await api.get('/ambassadors');
        setAmbassadors(res.data);
      } catch (error) {
        console.error('Error loading ambassadors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAmbassadors();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-primary">Michelin Bike</h1>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Ambassadeurs Michelin</h2>
          <p className="text-muted-foreground">
            Découvrez les athlètes qui font confiance à Michelin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ambassadors.map((ambassador) => (
            <Card key={ambassador.id}>
              <CardHeader>
                <CardTitle>{ambassador.cyclist.fullName}</CardTitle>
                <CardDescription>
                  {ambassador.discipline} - {ambassador.skillLevel}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{ambassador.bio}</p>

                {ambassador.stats && (
                  <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm">
                    <div className="flex justify-between">
                      <span>Distance mensuelle :</span>
                      <span className="font-semibold">{ambassador.stats.monthlyDistance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dénivelé total :</span>
                      <span className="font-semibold">{ambassador.stats.totalElevation} m</span>
                    </div>
                  </div>
                )}

                {ambassador.tires?.map((tireInfo: any) => (
                  <div key={tireInfo.bikeType} className="border-t pt-3 mt-3">
                    <p className="font-semibold text-sm">{tireInfo.tire.rangeName}</p>
                    <p className="text-xs text-muted-foreground italic mt-1">
                      "{tireInfo.testimonial}"
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
