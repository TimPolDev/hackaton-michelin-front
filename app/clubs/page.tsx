'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ClubsPage() {
  const router = useRouter();
  const [cyclist, setCyclist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await backend.cyclists.me();
        setCyclist(data);
      } catch (error) {
        console.error('Error loading clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inviteCode.trim();
    if (!code) return;
    // Extract token from URL if pasted as full link, otherwise use as-is
    const match = code.match(/\/clubs\/join\/([^/?#]+)/);
    const token = match ? match[1] : code;
    router.push(`/clubs/join/${token}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showJoinModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold">Rejoindre un club</h3>
            <p className="text-sm text-muted-foreground">
              Collez le code d'invitation ou le lien complet reçu d'un manager de club.
            </p>
            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <Input
                autoFocus
                placeholder="Code ou lien d'invitation"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={!inviteCode.trim()}>
                  Rejoindre
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowJoinModal(false); setInviteCode(''); }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Mes Clubs</h2>
            <p className="text-muted-foreground">
              Rejoignez ou créez un club cycliste
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowJoinModal(true)}>
              Rejoindre un club
            </Button>
            <Button onClick={() => router.push('/clubs/create')}>
              Créer un club
            </Button>
          </div>
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
