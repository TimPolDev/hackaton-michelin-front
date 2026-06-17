'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/api';
import type { BikeType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BIKE_TYPES = [
  { value: 'ROAD', label: 'Route' },
  { value: 'MTB', label: 'VTT' },
  { value: 'GRAVEL', label: 'Gravel' },
  { value: 'E_BIKE', label: 'Vélo électrique' },
];

const PRACTICE_STYLES = [
  { value: 'leisure', label: 'Loisir' },
  { value: 'competition', label: 'Compétition' },
  { value: 'cyclosport', label: 'Cyclosport' },
  { value: 'touring', label: 'Tourisme' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [selectedBikeTypes, setSelectedBikeTypes] = useState<string[]>([]);
  const [primaryBikeType, setPrimaryBikeType] = useState('');
  const [practiceStyle, setPracticeStyle] = useState('');
  const [preferences, setPreferences] = useState({
    grip: 5,
    endurance: 5,
    lightness: 5,
    versatility: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleBikeType = (type: string) => {
    if (selectedBikeTypes.includes(type)) {
      setSelectedBikeTypes(selectedBikeTypes.filter(t => t !== type));
      if (primaryBikeType === type) {
        setPrimaryBikeType('');
      }
    } else {
      setSelectedBikeTypes([...selectedBikeTypes, type]);
      if (!primaryBikeType) {
        setPrimaryBikeType(type);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await backend.auth.completeProfile({
        fullName,
        bikeTypes: selectedBikeTypes,
        primaryBikeType: primaryBikeType as BikeType,
        practiceStyle,
        preferences,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du profil');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complétez votre profil</CardTitle>
            <CardDescription>
              Quelques informations pour vous recommander le pneu idéal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Nom complet</label>
                <Input
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Types de vélo pratiqués</label>
                <div className="grid grid-cols-2 gap-2">
                  {BIKE_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleBikeType(type.value)}
                      className={`p-3 rounded-md border-2 transition-colors ${
                        selectedBikeTypes.includes(type.value)
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedBikeTypes.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type principal</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={primaryBikeType}
                    onChange={(e) => setPrimaryBikeType(e.target.value)}
                    required
                  >
                    {selectedBikeTypes.map((type) => (
                      <option key={type} value={type}>
                        {BIKE_TYPES.find(t => t.value === type)?.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Style de pratique</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={practiceStyle}
                  onChange={(e) => setPracticeStyle(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez...</option>
                  {PRACTICE_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium">Préférences (1-10)</label>

                {Object.entries(preferences).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm capitalize">{key === 'versatility' ? 'Polyvalence' : key === 'grip' ? 'Grip' : key === 'endurance' ? 'Endurance' : 'Légèreté'}</span>
                      <span className="text-sm font-medium">{value}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        [key]: parseInt(e.target.value),
                      })}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || selectedBikeTypes.length === 0}
              >
                {loading ? 'Création du profil...' : 'Continuer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
