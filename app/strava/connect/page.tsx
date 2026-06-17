'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function StravaConnectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');

  useEffect(() => {
    // Check if we're coming back from Strava OAuth
    const code = searchParams?.get('code');
    const errorParam = searchParams?.get('error');

    if (errorParam) {
      setError('Connexion à Strava annulée');
      return;
    }

    if (code) {
      handleStravaCallback(code);
    }
  }, [searchParams]);

  const handleStravaCallback = async (code: string) => {
    try {
      setLoading(true);
      setImportProgress('Connexion à Strava...');

      // Exchange code for access token and import activities
      await api.post('/strava/callback', { code });

      setImportProgress('Importation des activités...');
      await api.post('/strava/import');

      setSuccess(true);
      setImportProgress('Activités importées avec succès !');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion à Strava');
      setLoading(false);
    }
  };

  const initiateStravaConnection = async () => {
    try {
      setLoading(true);
      const res = await api.get('/strava/auth-url');
      window.location.href = res.data.authUrl;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🚴</span>
            Connecter Strava
          </CardTitle>
          <CardDescription>
            Importez vos activités Strava pour obtenir des recommandations personnalisées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
              {importProgress}
            </div>
          )}

          {loading && !success && (
            <div className="bg-blue-50 text-blue-600 p-3 rounded-md text-sm">
              {importProgress}
            </div>
          )}

          {!loading && !success && (
            <>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-sm text-orange-800 mb-2">
                  <strong>Pourquoi connecter Strava ?</strong>
                </p>
                <ul className="text-xs text-orange-700 space-y-1">
                  <li>• Analyse automatique de votre profil de roulage</li>
                  <li>• Recommandations de pneus personnalisées</li>
                  <li>• Statistiques détaillées par type de vélo</li>
                  <li>• Participation aux classements de clubs</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={initiateStravaConnection}
                  disabled={loading}
                  className="w-full bg-[#FC4C02] hover:bg-[#E34402] text-white"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Se connecter avec Strava
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Plus tard
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Vos données Strava sont synchronisées de manière sécurisée et ne sont jamais partagées sans votre consentement.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StravaConnectPage() {
  return (
    <Suspense fallback={null}>
      <StravaConnectContent />
    </Suspense>
  );
}
