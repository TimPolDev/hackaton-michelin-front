import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-michelin-navy mb-3">Contact</h1>
          <p className="text-muted-foreground text-lg">
            Une question, une suggestion ou un problème ? Nous sommes là pour vous aider.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-michelin-navy mb-6">Envoyer un message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Jean Dupont"
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-michelin-blue-dark"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jean@exemple.com"
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-michelin-blue-dark"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet
                </label>
                <select
                  id="subject"
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-michelin-blue-dark"
                >
                  <option value="">Choisir un sujet</option>
                  <option value="support">Support technique</option>
                  <option value="club">Gestion de club</option>
                  <option value="ambassador">Programme ambassadeur</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  placeholder="Décrivez votre demande..."
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-michelin-blue-dark resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-michelin-blue-dark px-4 py-2.5 text-sm font-semibold text-michelin-yellow transition-opacity hover:opacity-90"
              >
                Envoyer le message
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
              <h2 className="text-lg font-semibold text-michelin-navy">Nos coordonnées</h2>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-michelin-blue/10 text-michelin-blue">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-muted-foreground">contact@paceline.app</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-michelin-blue/10 text-michelin-blue">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Téléphone</p>
                  <p className="text-sm text-muted-foreground">+33 4 73 98 59 00</p>
                  <p className="text-xs text-muted-foreground">Lun–Ven, 9h–18h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-michelin-blue/10 text-michelin-blue">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Adresse</p>
                  <p className="text-sm text-muted-foreground">
                    23 place des Carmes-Déchaux<br />
                    63000 Clermont-Ferrand, France
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-michelin-blue p-6 text-white">
              <h3 className="font-semibold mb-2">Support communauté</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Pour les questions liées à votre club ou votre compte, consultez d\'abord notre FAQ
                ou contactez directement votre ambassadeur référent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
