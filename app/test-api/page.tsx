'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';

export default function TestApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing with fetch...');
      const response = await fetch('http://localhost:3001/api/v1/ambassadors');
      const data = await response.json();
      console.log('✅ Fetch successful:', data);
      setResult({ method: 'fetch', success: true, data });
    } catch (err: any) {
      console.error('❌ Fetch failed:', err);
      setError('Fetch: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAxios = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing with Axios...');
      const response = await api.get('/ambassadors');
      console.log('✅ Axios successful:', response.data);
      setResult({ method: 'axios', success: true, data: response.data });
    } catch (err: any) {
      console.error('❌ Axios failed:', err);
      setError('Axios: ' + err.message);
      setResult({
        method: 'axios',
        success: false,
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  const testAxiosDirect = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing with Axios (direct URL)...');
      const response = await api.get('http://localhost:3001/api/v1/ambassadors');
      console.log('✅ Axios direct successful:', response.data);
      setResult({ method: 'axios-direct', success: true, data: response.data });
    } catch (err: any) {
      console.error('❌ Axios direct failed:', err);
      setError('Axios direct: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test API Connection</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Ouvrez la console du navigateur (F12)</li>
            <li>Cliquez sur chaque bouton de test</li>
            <li>Regardez les logs dans la console</li>
            <li>Les résultats s'afficheront ci-dessous</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          <div className="space-y-4">
            <button
              onClick={testFetch}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              Test 1: Fetch (natif)
            </button>

            <button
              onClick={testAxios}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              Test 2: Axios (avec baseURL)
            </button>

            <button
              onClick={testAxiosDirect}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              Test 3: Axios (URL complète)
            </button>
          </div>
        </div>

        {loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">Chargement en cours...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">Erreur</p>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        )}

        {result && (
          <div className={`border rounded-lg p-4 ${
            result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              Résultat ({result.method})
            </p>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Configuration actuelle</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p><strong>Frontend:</strong> http://localhost:3000</p>
            <p><strong>Backend (attendu):</strong> http://localhost:3001/api/v1</p>
            <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || '(non défini)'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
