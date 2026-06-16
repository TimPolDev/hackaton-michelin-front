'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const BIKE_TYPES = [
  { value: 'ROAD', label: 'Route' },
  { value: 'MTB', label: 'VTT' },
  { value: 'GRAVEL', label: 'Gravel' },
  { value: 'E_BIKE', label: 'Vélo électrique' },
];

export default function CreateClubPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBikeTypes, setSelectedBikeTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleBikeType = (type: string) => {
    if (selectedBikeTypes.includes(type)) {
      setSelectedBikeTypes(selectedBikeTypes.filter(t => t !== type));
    } else {
      setSelectedBikeTypes([...selectedBikeTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/clubs', {
        name,
        description,
        bikeTypes: selectedBikeTypes.length > 0 ? selectedBikeTypes : null,
      });

      router.push(`/clubs/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du club');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 p-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/clubs')}>
            ← Retour aux clubs
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Créer un club</CardTitle>
            <CardDescription>
              Créez votre club cycliste et invitez vos amis
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
                <label className="text-sm font-medium">Nom du club</label>
                <Input
                  placeholder="Ex: Cyclistes de Paris"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full p-3 border rounded-md min-h-[100px]"
                  placeholder="Décrivez votre club, son esprit, ses objectifs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Types de vélo (optionnel)
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Laissez vide pour accepter tous les types de vélo
                </p>
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

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer le club'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
