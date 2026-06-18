'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { backend } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ClubPreview {
  id: string;
  name: string;
  description: string | null;
  bikeTypeFilter?: string | null;
  isMultiBikeType?: boolean;
  city?: string | null;
  region?: string | null;
  memberCount?: number;
}

export default function JoinClubPage() {
  const router = useRouter();
  const params = useParams();
  const inviteCode = params?.code as string;

  const [club, setClub] = useState<ClubPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!inviteCode) return;
    backend.clubs
      .getByInvite(inviteCode)
      .then((data: ClubPreview) => setClub(data))
      .catch((err: any) => {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Invitation invalide ou expirée";
        setError(Array.isArray(msg) ? msg.join('\n') : msg);
      })
      .finally(() => setLoading(false));
  }, [inviteCode]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      const result = await backend.clubs.joinByToken(inviteCode);
      router.push(`/clubs/${result.club?.id ?? ''}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'adhésion au club');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="text-center">
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !club) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation invalide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push('/clubs')} className="w-full">
              Retour aux clubs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rejoindre un club</CardTitle>
          <CardDescription>
            Vous avez été invité à rejoindre ce club
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {club && (
            <>
              <div className="bg-white border rounded-lg p-4 space-y-2">
                <h3 className="text-xl font-bold">{club.name}</h3>
                {club.description && (
                  <p className="text-muted-foreground">{club.description}</p>
                )}

                {club.bikeTypeFilter && (
                  <div className="flex gap-2 flex-wrap pt-2">
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {club.bikeTypeFilter}
                    </span>
                    {club.isMultiBikeType && (
                      <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                        Multi-disciplines
                      </span>
                    )}
                  </div>
                )}

                {(club.city || club.region) && (
                  <p className="text-sm text-muted-foreground pt-2">
                    📍 {[club.city, club.region].filter(Boolean).join(', ')}
                  </p>
                )}

                {club.memberCount !== undefined && (
                  <p className="text-sm text-muted-foreground pt-2">
                    {club.memberCount} membre{club.memberCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full"
                >
                  {joining ? 'Adhésion...' : 'Rejoindre ce club'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/clubs')}
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
