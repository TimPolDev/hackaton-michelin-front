'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClubsPage() {
  const router = useRouter();
  const [cyclist, setCyclist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/cyclists/me');
        setCyclist(res.data);
      } catch (error) {
        console.error('Error loading clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Mes Clubs</h2>
            <p className="text-muted-foreground">
              Rejoignez ou créez un club cycliste
            </p>
          </div>
          <Button onClick={() => router.push('/clubs/create')}>
            Créer un club
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cyclist?.clubMemberships?.map((membership: any) => (
            <Card key={membership.club.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/clubs/${membership.club.id}`)}>
              <CardHeader>
                <CardTitle>{membership.club.name}</CardTitle>
                <CardDescription>{membership.club.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {membership.isManager && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Manager
                  </span>
                )}
              </CardContent>
            </Card>
          ))}

          {(!cyclist?.clubMemberships || cyclist.clubMemberships.length === 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Aucun club</CardTitle>
                <CardDescription>
                  Créez votre premier club ou rejoignez-en un avec un lien d'invitation
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
