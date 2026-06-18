'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { backend } from '@/lib/api';
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

      // connect-strava échange le code ET importe les activités en une étape.
      setImportProgress('Importation des activités...');
      await backend.activities.connectStrava(code);

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
      const { url } = await backend.activities.stravaAuthorizeUrl();
      window.location.href = url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#27509B] text-white p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          <h1 className="text-3xl font-bold mb-2">Connecter Strava</h1>
          <p className="text-white/90 text-sm">
            Synchronisez vos activités pour des recommandations personnalisées
          </p>
        </div>

        <div className="p-6 space-y-4">
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-xl">
                <p className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  Pourquoi connecter Strava ?
                </p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-[#27509B] font-bold">•</span>
                    <span>Analyse automatique de votre profil de roulage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#27509B] font-bold">•</span>
                    <span>Recommandations de pneus Michelin personnalisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#27509B] font-bold">•</span>
                    <span>Traces GPS et statistiques détaillées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#27509B] font-bold">•</span>
                    <span>Participation aux classements de clubs</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={initiateStravaConnection}
                  disabled={loading}
                  className="w-full bg-[#27509B] hover:bg-[#1e3f7a] text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                    </svg>
                    Se connecter avec Strava
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700"
                >
                  Plus tard
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                🔒 Vos données Strava sont synchronisées de manière sécurisée et ne sont jamais partagées sans votre consentement.
              </p>
            </>
          )}
        </div>
      </div>
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
