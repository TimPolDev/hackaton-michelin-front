'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Club {
  id: string;
  name: string;
  description: string;
  bikeTypes: string[] | null;
  inviteCode: string;
  createdAt: string;
}

interface Stats {
  totalDistance: number;
  totalElevation: number;
  activityCount: number;
  leaderboard: Array<{
    cyclistName: string;
    distance: number;
    elevation: number;
  }>;
}

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params?.id as string;

  const [club, setClub] = useState<Club | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);

  useEffect(() => {
    if (!clubId) return;
    loadClubData();
  }, [clubId]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      const [clubRes, statsRes] = await Promise.all([
        api.get(`/clubs/${clubId}`),
        api.get(`/clubs/${clubId}/stats`),
      ]);

      setClub(clubRes.data);
      setStats(statsRes.data);

      // Check if current user is manager
      const cyclistRes = await api.get('/cyclists/me');
      const membership = cyclistRes.data.clubMemberships?.find(
        (m: any) => m.club.id === clubId
      );
      setIsManager(membership?.isManager || false);
    } catch (error) {
      console.error('Error loading club:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!club) return;
    const inviteLink = `${window.location.origin}/clubs/join/${club.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    setInviteCodeCopied(true);
    setTimeout(() => setInviteCodeCopied(false), 2000);
  };

  const handleLeaveClub = async () => {
    if (!confirm('Voulez-vous vraiment quitter ce club ?')) return;
    try {
      await api.delete(`/clubs/${clubId}/leave`);
      router.push('/clubs');
    } catch (error) {
      alert('Erreur lors de la sortie du club');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Club introuvable</h2>
          <Button onClick={() => router.push('/clubs')}>Retour aux clubs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-primary">Michelin Bike</h1>
            <Button variant="ghost" onClick={() => router.push('/clubs')}>
              ← Mes clubs
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{club.name}</h2>
              <p className="text-muted-foreground mt-2">{club.description}</p>
              {club.bikeTypes && club.bikeTypes.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {club.bikeTypes.map((type) => (
                    <span
                      key={type}
                      className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isManager && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  Manager
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distance totale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalDistance || 0} km</div>
              <p className="text-sm text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dénivelé total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalElevation || 0} m</div>
              <p className="text-sm text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activityCount || 0}</div>
              <p className="text-sm text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Classement du mois</CardTitle>
              <CardDescription>Les cyclistes les plus actifs</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.leaderboard && stats.leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {stats.leaderboard.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? 'bg-yellow-400 text-yellow-900'
                              : index === 1
                              ? 'bg-gray-300 text-gray-700'
                              : index === 2
                              ? 'bg-orange-400 text-orange-900'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{entry.cyclistName}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.distance.toFixed(0)} km • {entry.elevation.toFixed(0)} m D+
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune activité pour le moment</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inviter des membres</CardTitle>
              <CardDescription>Partagez le code d'invitation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lien d'invitation</label>
                <div className="flex gap-2">
                  <Input
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/clubs/join/${club.inviteCode}`}
                    readOnly
                  />
                  <Button onClick={copyInviteLink}>
                    {inviteCodeCopied ? 'Copié !' : 'Copier'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Code d'invitation</label>
                <div className="flex gap-2">
                  <Input value={club.inviteCode} readOnly />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(club.inviteCode);
                      setInviteCodeCopied(true);
                      setTimeout(() => setInviteCodeCopied(false), 2000);
                    }}
                  >
                    {inviteCodeCopied ? 'Copié !' : 'Copier'}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="destructive" onClick={handleLeaveClub} className="w-full">
                  Quitter le club
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
