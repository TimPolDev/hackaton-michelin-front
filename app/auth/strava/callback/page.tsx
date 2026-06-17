'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { backend } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function StravaCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importProgress, setImportProgress] = useState<string>('Connexion à Strava...');

  useEffect(() => {
    const code = searchParams?.get('code');
    const errorParam = searchParams?.get('error');

    if (errorParam) {
      setError('Connexion à Strava annulée');
      setLoading(false);
      return;
    }

    if (!code) {
      setError('Code d\'autorisation manquant');
      setLoading(false);
      return;
    }

    handleStravaCallback(code);
  }, [searchParams]);

  const handleStravaCallback = async (code: string) => {
    try {
      setImportProgress('Connexion à Strava...');

      // connect-strava échange le code ET importe les activités en une étape.
      setImportProgress('Importation des activités...');
      const result = await backend.activities.connectStrava(code);

      setImportProgress(`✅ ${result.imported || 0} activités importées avec succès !`);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Strava connection error:', err);
      setError(err.response?.data?.message || 'Erreur lors de la connexion à Strava');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🚴</span>
            Connexion Strava
          </CardTitle>
          <CardDescription>
            Traitement de votre autorisation Strava...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
              <p className="font-semibold mb-2">❌ Erreur</p>
              <p>{error}</p>
              <button
                onClick={() => router.push('/strava/connect')}
                className="mt-3 text-sm underline hover:no-underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-blue-50 text-blue-600 p-4 rounded-md text-sm">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <p>{importProgress}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StravaCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <StravaCallbackContent />
    </Suspense>
  );
}
