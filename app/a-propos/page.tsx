import { Target, Users, Award, Zap } from 'lucide-react';

const VALUES = [
  {
    icon: Target,
    title: 'Performance',
    description:
      "Nous aidons les cyclistes à repousser leurs limites grâce à des données d'activité précises et des outils de suivi avancés.",
  },
  {
    icon: Users,
    title: 'Communauté',
    description:
      "PaceLine fédère des milliers de cyclistes en clubs actifs, favorisant le partage, l'entraide et la progression collective."
  },
  {
    icon: Award,
    title: 'Expertise Michelin',
    description:
      "Derrière PaceLine se trouve l'expertise centenaire de Michelin, leader mondial du pneumatique et passionné de mobilité durable."
  },
  {
    icon: Zap,
    title: 'Innovation',
    description:
      "Nos outils d'analyse de trajectoires et de recommandation de pneus sont conçus pour évoluer avec vos besoins."
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-michelin-navy mb-4">À propos de PaceLine</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PaceLine est la plateforme de cyclisme performant, développée en partenariat avec Michelin,
            pour connecter les passionnés de vélo et les aider à progresser ensemble.
          </p>
        </div>

        {/* Story */}
        <div className="mb-12 rounded-2xl bg-michelin-blue p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Notre histoire</h2>
          <p className="text-white/80 leading-relaxed mb-3">
            Née d'une collaboration entre ingénieurs passionnés de cyclisme et l'équipe innovation de Michelin,
            PaceLine a été fondée avec une mission claire : rendre la performance cycliste accessible à tous,
            du cycliste du dimanche au compétiteur confirmé.
          </p>
          <p className="text-white/80 leading-relaxed">
            Aujourd'hui, notre communauté regroupe des clubs actifs à travers toute la France, avec des
            ambassadeurs qui partagent leur expertise pour guider et inspirer chaque membre.
          </p>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-bold text-michelin-navy mb-6">Nos valeurs</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-12">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-michelin-blue/10 text-michelin-blue mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-michelin-navy mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            );
          })}
        </div>

        {/* Michelin */}
        <div className="rounded-xl border border-michelin-yellow bg-michelin-yellow/10 p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-michelin-blue mb-2">Powered by Michelin</p>
          <p className="text-muted-foreground text-sm">
            Michelin, fondé en 1889, est le leader mondial du pneumatique et s'engage pour une mobilité plus sûre,
            plus efficace et plus durable. PaceLine est le fruit de cet engagement au service du cyclisme.
          </p>
        </div>
      </div>
    </div>
  );
}
