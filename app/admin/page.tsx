'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CyclistSelect } from '@/components/admin/CyclistSelect';
import { TireSelector, TireAssignment } from '@/components/admin/TireSelector';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface Ambassador {
  id: string;
  cyclist: {
    fullName: string;
    email: string;
  };
  discipline: string;
  skillLevel: string;
  bio: string;
}

interface Club {
  id: string;
  name: string;
  description: string;
  memberCount?: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ambassadors' | 'clubs'>('ambassadors');
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambassador creation form
  const [newAmbassador, setNewAmbassador] = useState({
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

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'ambassadors') {
        const res = await api.get('/ambassadors');
        setAmbassadors(res.data);
      } else {
        const res = await api.get('/clubs');
        setClubs(res.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAmbassador = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create ambassador profile
      const response = await api.post('/ambassadors', newAmbassador);
      const ambassadorId = response.data.id;

      // Create tire assignments
      for (const assignment of tireAssignments) {
        if (assignment.tireId && assignment.bikeType && assignment.testimonial) {
          await api.post(`/ambassadors/${ambassadorId}/tires`, assignment);
        }
      }

      // Reset form
      setNewAmbassador({
        cyclistId: '',
        discipline: '',
        skillLevel: 'PROFESSIONAL',
        bio: '',
        photoUrl: '',
        photos: [],
        articleContent: '',
        showRidingData: false,
        featuredSegments: '',
        isFeatured: false,
      });
      setTireAssignments([]);
      loadData();
      alert('Ambassadeur créé avec succès !');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleDeleteAmbassador = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet ambassadeur ?')) return;
    try {
      await api.delete(`/ambassadors/${id}`);
      loadData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteClub = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce club ?')) return;
    try {
      await api.delete(`/clubs/${id}`);
      loadData();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-4">
          <Button
            variant={activeTab === 'ambassadors' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ambassadors')}
          >
            Ambassadeurs ({ambassadors.length})
          </Button>
          <Button
            variant={activeTab === 'clubs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('clubs')}
          >
            Clubs ({clubs.length})
          </Button>
        </div>

        {activeTab === 'ambassadors' && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Créer un ambassadeur</CardTitle>
                <CardDescription>Ajouter un nouveau cycliste ambassadeur Michelin</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAmbassador} className="space-y-6">
                  {/* Sélection du cycliste */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cycliste</label>
                    <CyclistSelect
                      value={newAmbassador.cyclistId}
                      onChange={(cyclistId) => setNewAmbassador({ ...newAmbassador, cyclistId })}
                    />
                  </div>

                  {/* Informations de base */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discipline</label>
                      <Input
                        placeholder="Ex: Course sur route, VTT cross-country..."
                        value={newAmbassador.discipline}
                        onChange={(e) => setNewAmbassador({ ...newAmbassador, discipline: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Niveau</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newAmbassador.skillLevel}
                        onChange={(e) => setNewAmbassador({ ...newAmbassador, skillLevel: e.target.value })}
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
                      value={newAmbassador.bio}
                      onChange={(e) => setNewAmbassador({ ...newAmbassador, bio: e.target.value })}
                      required
                    />
                  </div>

                  {/* Photos */}
                  <ImageUploader
                    mainPhotoUrl={newAmbassador.photoUrl}
                    additionalPhotos={newAmbassador.photos}
                    onMainPhotoChange={(url) => setNewAmbassador({ ...newAmbassador, photoUrl: url || '' })}
                    onAdditionalPhotosChange={(photos) => setNewAmbassador({ ...newAmbassador, photos })}
                  />

                  {/* Article */}
                  {/* <div className="space-y-2">
                    <label className="text-sm font-medium">Article</label>
                    <RichTextEditor
                      content={newAmbassador.articleContent}
                      onChange={(content) => setNewAmbassador({ ...newAmbassador, articleContent: content })}
                      placeholder="Écrivez un article détaillé sur l'ambassadeur..."
                    />
                  </div> */}

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
                        checked={newAmbassador.showRidingData}
                        onChange={(e) => setNewAmbassador({ ...newAmbassador, showRidingData: e.target.checked })}
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
                        checked={newAmbassador.isFeatured}
                        onChange={(e) => setNewAmbassador({ ...newAmbassador, isFeatured: e.target.checked })}
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
                        value={newAmbassador.featuredSegments}
                        onChange={(e) => setNewAmbassador({ ...newAmbassador, featuredSegments: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">Créer l'ambassadeur</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Ambassadeurs actifs</h3>
              {loading ? (
                <p>Chargement...</p>
              ) : (
                <div className="grid gap-4">
                  {ambassadors.map((ambassador) => (
                    <Card key={ambassador.id}>
                      <CardContent className="flex justify-between items-start p-6">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{ambassador.cyclist.fullName}</h4>
                          <p className="text-sm text-muted-foreground">{ambassador.cyclist.email}</p>
                          <p className="text-sm mt-2">
                            <span className="font-semibold">{ambassador.discipline}</span> - {ambassador.skillLevel}
                          </p>
                          <p className="text-sm mt-2">{ambassador.bio}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/ambassadors/${ambassador.id}`)}
                          >
                            Éditer
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAmbassador(ambassador.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'clubs' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Clubs enregistrés</h3>
            {loading ? (
              <p>Chargement...</p>
            ) : (
              <div className="grid gap-4">
                {clubs.map((club) => (
                  <Card key={club.id}>
                    <CardContent className="flex justify-between items-start p-6">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{club.name}</h4>
                        <p className="text-sm text-muted-foreground">{club.description}</p>
                        {club.memberCount !== undefined && (
                          <p className="text-sm mt-2">Membres: {club.memberCount}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/clubs/${club.id}`)}
                        >
                          Voir
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClub(club.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
