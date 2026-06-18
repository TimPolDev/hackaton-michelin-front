'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/page-loader';

export default function ParametresPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cyclist, setCyclist] = useState<any>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const cyclistData = await backend.cyclists.me();
      setCyclist(cyclistData);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectStrava = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter Strava ? Vos activités resteront sauvegardées mais vous ne pourrez plus les synchroniser.')) {
      return;
    }

    setDisconnecting(true);
    try {
      await backend.activities.disconnectStrava();
      await loadData(); // Reload data
      alert('✅ Strava déconnecté avec succès');
    } catch (error) {
      console.error('Error disconnecting Strava:', error);
      alert('❌ Erreur lors de la déconnexion de Strava');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSyncStrava = async () => {
    setSyncing(true);
    try {
      const result = await backend.activities.syncStrava();
      alert(`✅ Synchronisation réussie ! ${result.newActivitiesImported} nouvelle(s) activité(s) importée(s)`);
      router.push('/activities');
    } catch (error) {
      console.error('Error syncing Strava:', error);
      alert('❌ Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const handleResetActivities = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer toutes vos activités et les réimporter depuis Strava ? Cette action est nécessaire pour récupérer les traces GPS.')) {
      return;
    }

    setResetting(true);
    try {
      const result = await backend.activities.resetActivities();
      alert(`✅ Activités réinitialisées ! ${result.reimported} activité(s) réimportée(s) avec les traces GPS`);
      await loadData(); // Reload data
      router.push('/activities');
    } catch (error) {
      console.error('Error resetting activities:', error);
      alert('❌ Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (loading) {
    return <PageLoader label="Chargement des paramètres..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#27509B] text-white px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold italic mb-1 md:mb-2">Paramètres</h1>
          <p className="text-sm md:text-base text-white/70">Gérez votre compte et vos préférences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profil */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Profil</CardTitle>
            <CardDescription>Informations de votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
              <div className="mt-1 text-base font-medium">
                {cyclist?.fullName || 'Non renseigné'}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="mt-1 text-base">{cyclist?.email}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Type de compte</label>
              <div className="mt-1 flex gap-2">
                {cyclist?.isAdmin && (
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    👑 Administrateur
                  </Badge>
                )}
                {cyclist?.isAmbassador && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Ambassadeur
                  </Badge>
                )}
                {!cyclist?.isAdmin && !cyclist?.isAmbassador && (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18.5" cy="17.5" r="3.5"/>
                      <circle cx="5.5" cy="17.5" r="3.5"/>
                      <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                    </svg>
                    Cycliste
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connexion Strava */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-6 h-6 text-[#27509B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="15" cy="5" r="1"/>
                <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
              </svg>
              Connexion Strava
            </CardTitle>
            <CardDescription>
              Gérez votre connexion avec Strava pour importer vos activités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cyclist?.stravaId ? (
              <>
                {/* Connecté */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#27509B]">
                        <span className="text-2xl">✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Strava connecté</p>
                        <p className="text-sm text-green-700">
                          Athlete ID: {cyclist.stravaId}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Connecté le {formatDate(cyclist.stravaConnectedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleSyncStrava}
                      disabled={syncing || resetting}
                      className="flex-1 bg-[#27509B] hover:bg-[#1e3f7a] text-white flex items-center gap-2"
                    >
                      <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                      </svg>
                      {syncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
                    </Button>

                    <Button
                      onClick={handleDisconnectStrava}
                      disabled={disconnecting || resetting}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                      {disconnecting ? 'Déconnexion...' : 'Déconnecter'}
                    </Button>
                  </div>

                  <Button
                    onClick={handleResetActivities}
                    disabled={resetting || syncing || disconnecting}
                    variant="outline"
                    className="w-full border-[#27509B]/40 text-[#27509B] hover:bg-[#27509B]/10 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {resetting ? 'Réinitialisation en cours...' : 'Réimporter avec traces GPS'}
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    La synchronisation importe les nouvelles activités depuis votre dernière connexion.
                  </p>

                  <p className="text-xs text-[#27509B]">
                    La réinitialisation supprime toutes vos activités et les réimporte avec les traces GPS pour les cartes.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Non connecté */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    Connectez votre compte Strava pour importer automatiquement vos activités
                    et obtenir des recommandations de pneus personnalisées.
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                    <li>Import automatique de vos sorties</li>
                    <li>Statistiques détaillées</li>
                    <li>Traces GPS sur cartes interactives</li>
                    <li>Recommandations personnalisées</li>
                  </ul>
                </div>

                <Button
                  onClick={() => router.push('/strava/connect')}
                  className="w-full bg-[#27509B] hover:bg-[#1e3f7a] text-white py-6"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Connecter Strava
                  </span>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Préférences */}
        {/* <Card>
          <CardHeader>
            <CardTitle>⚙️ Préférences</CardTitle>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">Recevoir des alertes sur les nouvelles activités</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Profil public</p>
                <p className="text-sm text-muted-foreground">Rendre votre profil visible aux autres cyclistes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Newsletter Michelin</p>
                <p className="text-sm text-muted-foreground">Conseils, nouveautés et offres exclusives</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card> */}

        {/* Zone de danger */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">⚠️ Zone de danger</CardTitle>
            <CardDescription>Actions irréversibles sur votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                  alert('Cette fonctionnalité sera bientôt disponible');
                }
              }}
            >
              🗑️ Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
