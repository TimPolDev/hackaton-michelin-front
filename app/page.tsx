import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            PaceLine
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Trouvez le pneu parfait pour votre pratique cycliste
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Commencer
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🚴</div>
            <h3 className="text-xl font-bold mb-2">Recommandations personnalisées</h3>
            <p className="text-gray-600">
              Analysez vos données Strava et obtenez des recommandations de pneus adaptées à votre profil
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Clubs cyclistes</h3>
            <p className="text-gray-600">
              Créez ou rejoignez un club, suivez les statistiques collectives et défiez vos amis
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">Ambassadeurs</h3>
            <p className="text-gray-600">
              Découvrez les athlètes qui font confiance à Michelin et leurs choix de pneus
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Hackathon ESGI 2026 — Réseau Skolae × Michelin Vélo</p>
        </div>
      </div>
    </div>
  );
}
