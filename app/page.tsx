'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section - Full viewport avec parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#27509B] via-[#2d5ba8] to-[#1a3d7a]">
        {/* Animated background elements */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FCE500] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FCE500] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-[#FCE500] rounded-full animate-pulse" />
            <span className="text-white/90 text-sm font-medium">Propulsé par Michelin</span>
          </div>

          {/* Main Title */}
          <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-6 text-white leading-none animate-slide-up">
            <span className="block">Votre pneu</span>
            <span className="block bg-gradient-to-r from-[#FCE500] via-[#fff7a0] to-[#FCE500] bg-clip-text text-transparent animate-gradient">
              parfait
            </span>
            <span className="block text-6xl md:text-7xl lg:text-8xl">vous attend</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
            Synchronisez vos activités Strava, obtenez des recommandations personnalisées
            et rejoignez une communauté de cyclistes passionnés
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-delay-2">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-lg px-10 py-7 bg-[#FCE500] hover:bg-[#e5d000] text-[#27509B] font-bold shadow-2xl hover:shadow-[#FCE500]/50 transform hover:scale-105 transition-all duration-300 rounded-xl"
              >
                Commencer gratuitement →
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 border-2 border-white text-[#27509B] hover:bg-white hover:text-[#27509B] font-semibold transform hover:scale-105 transition-all duration-300 rounded-xl"
              >
                Se connecter
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce mt-12">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/60 rounded-full animate-scroll" />
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-24 fill-white">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <span className="text-[#27509B] font-bold uppercase tracking-wider text-sm mb-4 block">Fonctionnalités</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une plateforme complète pour optimiser votre expérience cycliste
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border-2 border-gray-100 hover:border-[#27509B] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#27509B] to-[#1a3d7a] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Recommandations IA</h3>
              <p className="text-gray-600 leading-relaxed">
                Notre algorithme intelligent analyse vos données Strava pour vous recommander
                les pneus Michelin parfaitement adaptés à votre style de roulage
              </p>
              <div className="mt-6 flex items-center text-[#27509B] font-semibold group-hover:translate-x-2 transition-transform">
                En savoir plus →
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border-2 border-gray-100 hover:border-[#FCE500] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FCE500] to-[#e5d000] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-[#27509B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Clubs & Communauté</h3>
              <p className="text-gray-600 leading-relaxed">
                Créez ou rejoignez des clubs, partagez vos performances,
                participez à des défis et progressez ensemble
              </p>
              <div className="mt-6 flex items-center text-[#27509B] font-semibold group-hover:translate-x-2 transition-transform">
                Découvrir →
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border-2 border-gray-100 hover:border-[#27509B] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#27509B] to-[#1a3d7a] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-[#FCE500]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Ambassadeurs Pro</h3>
              <p className="text-gray-600 leading-relaxed">
                Inspirez-vous des meilleurs athlètes, découvrez leurs setups
                et bénéficiez de leurs retours d'expérience
              </p>
              <div className="mt-6 flex items-center text-[#27509B] font-semibold group-hover:translate-x-2 transition-transform">
                Explorer →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#27509B] to-[#1a3d7a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.svg')] bg-repeat" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-6xl font-black text-[#FCE500] mb-2">10K+</div>
              <div className="text-white/80 font-medium">Cyclistes actifs</div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-6xl font-black text-[#FCE500] mb-2">500+</div>
              <div className="text-white/80 font-medium">Clubs créés</div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-6xl font-black text-[#FCE500] mb-2">1M+</div>
              <div className="text-white/80 font-medium">KM parcourus</div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-6xl font-black text-[#FCE500] mb-2">98%</div>
              <div className="text-white/80 font-medium">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
            Prêt à rouler avec
            <span className="text-[#27509B]"> Michelin</span> ?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Rejoignez des milliers de cyclistes qui ont déjà trouvé leur pneu idéal
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="text-xl px-12 py-8 bg-[#FCE500] hover:bg-[#e5d000] text-[#27509B] font-bold shadow-2xl hover:shadow-[#FCE500]/50 transform hover:scale-105 transition-all duration-300 rounded-xl"
            >
              Commencer maintenant →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#27509B] text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            Hackathon ESGI 2026 — Réseau Skolae × Michelin Vélo
          </p>
          <p className="text-white/40 text-xs mt-2">
            © 2026 PaceLine. Tous droits réservés.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-delay { animation: fade-in 0.8s ease-out 0.2s backwards; }
        .animate-fade-in-delay-2 { animation: fade-in 0.8s ease-out 0.4s backwards; }
        .animate-slide-up { animation: slide-up 1s ease-out; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-scroll { animation: scroll 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
