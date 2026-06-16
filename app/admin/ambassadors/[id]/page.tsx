'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CyclistSelect } from '@/components/admin/CyclistSelect';
import { TireSelector, TireAssignment } from '@/components/admin/TireSelector';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

export default function EditAmbassadorPage() {
  const router = useRouter();
  const params = useParams();
  const ambassadorId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cyclistInfo, setCyclistInfo] = useState({ fullName: '', email: '' });
  const [ambassador, setAmbassador] = useState({
    cyclistId: '',
    discipline: '',
    skillLevel: 'PROFESSIONAL',
    bio: '',
    photoUrl: '',
    photos: [] as string[],
    articleContent: '',
    showRidingData: false,
    featuredSegments: '',
    isFeatured: false,
  });
  const [tireAssignments, setTireAssignments] = useState<TireAssignment[]>([]);
  const [existingTires, setExistingTires] = useState<any[]>([]);

  useEffect(() => {
    loadAmbassador();
  }, [ambassadorId]);

  const loadAmbassador = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ambassadors/${ambassadorId}`);
      const data = res.data;

      setCyclistInfo({
        fullName: data.cyclist.fullName || 'N/A',
        email: data.cyclist.email,
      });

      setAmbassador({
        cyclistId: data.cyclist.id,
        discipline: data.discipline,
        skillLevel: data.skillLevel,
        bio: data.bio,
        photoUrl: data.photoUrl || '',
        photos: data.photos || [],
        articleContent: data.articleContent || '',
        showRidingData: data.showRidingData,
        featuredSegments: data.featuredSegments || '',
        isFeatured: data.isFeatured,
      });

      // Load existing tires
      setExistingTires(data.tires || []);
      setTireAssignments(
        (data.tires || []).map((t: any) => ({
          tireId: t.tire.id,
          bikeType: t.bikeType,
          testimonial: t.testimonial,
        }))
      );
    } catch (error) {
      console.error('Error loading ambassador:', error);
      alert('Erreur lors du chargement de l\'ambassadeur');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAmbassador = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Update ambassador profile (don't send cyclistId as it's not updatable)
      const { cyclistId, ...updateData } = ambassador;
      await api.put(`/ambassadors/${ambassadorId}`, updateData);

      // Handle tire assignments
      // First, collect existing tire IDs to know which ones to keep/delete
      const existingTireIds = new Set(existingTires.map(t => t.tire.id));
      const newTireIds = new Set(tireAssignments.map(t => t.tireId));

      // Delete tires that are no longer in the list
      for (const tire of existingTires) {
        if (!newTireIds.has(tire.tire.id)) {
          await api.delete(`/ambassadors/${ambassadorId}/tires/${tire.tire.id}`);
        }
      }

      // Add or update tires
      for (const assignment of tireAssignments) {
        if (assignment.tireId && assignment.bikeType && assignment.testimonial) {
          if (!existingTireIds.has(assignment.tireId)) {
            // Add new tire
            await api.post(`/ambassadors/${ambassadorId}/tires`, assignment);
          }
          // Note: For updates, we'd need a PUT endpoint, for now we delete and recreate
        }
      }

      alert('Ambassadeur mis à jour avec succès !');
      router.push('/admin');
    } catch (error: any) {
      console.error('Error updating ambassador:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" className="mb-4" onClick={() => router.push('/admin')}>
          ← Retour
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Modifier l'ambassadeur</CardTitle>
            <CardDescription>Mettre à jour les informations de l'ambassadeur</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateAmbassador} className="space-y-6">
              {/* Cycliste (non modifiable) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cycliste (non modifiable)</label>
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-100">
                  <p className="font-semibold text-gray-900">{cyclistInfo.fullName}</p>
                  <p className="text-sm text-gray-600">{cyclistInfo.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Le cycliste ne peut pas être modifié après la création
                </p>
              </div>

              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discipline</label>
                  <Input
                    placeholder="Ex: Course sur route, VTT cross-country..."
                    value={ambassador.discipline}
                    onChange={(e) => setAmbassador({ ...ambassador, discipline: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Niveau</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={ambassador.skillLevel}
                    onChange={(e) => setAmbassador({ ...ambassador, skillLevel: e.target.value })}
                  >
                    <option value="PROFESSIONAL">Professionnel</option>
                    <option value="ELITE">Elite</option>
                    <option value="AMATEUR">Amateur</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Biographie courte de l'ambassadeur..."
                  value={ambassador.bio}
                  onChange={(e) => setAmbassador({ ...ambassador, bio: e.target.value })}
                  required
                />
              </div>

              {/* Photos */}
              <ImageUploader
                mainPhotoUrl={ambassador.photoUrl}
                additionalPhotos={ambassador.photos}
                onMainPhotoChange={(url) => setAmbassador({ ...ambassador, photoUrl: url || '' })}
                onAdditionalPhotosChange={(photos) => setAmbassador({ ...ambassador, photos })}
              />

              {/* Article */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Article</label>
                <RichTextEditor
                  content={ambassador.articleContent}
                  onChange={(content) => setAmbassador({ ...ambassador, articleContent: content })}
                  placeholder="Écrivez un article détaillé sur l'ambassadeur..."
                />
              </div>

              {/* Tire assignments */}
              <TireSelector
                assignments={tireAssignments}
                onChange={setTireAssignments}
              />

              {/* Options avancées */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium">Options d'affichage</h4>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showRidingData"
                    checked={ambassador.showRidingData}
                    onChange={(e) => setAmbassador({ ...ambassador, showRidingData: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="showRidingData" className="text-sm">
                    Afficher les données de roulage Strava
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={ambassador.isFeatured}
                    onChange={(e) => setAmbassador({ ...ambassador, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isFeatured" className="text-sm">
                    Mettre en avant sur la page d'accueil
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Segments remarquables (optionnel)</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={2}
                    placeholder="Performances et segments notables..."
                    value={ambassador.featuredSegments}
                    onChange={(e) => setAmbassador({ ...ambassador, featuredSegments: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin')}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
