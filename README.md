# Michelin Bike - Frontend Next.js

Application web complète pour la recommandation de pneus cyclistes basée sur les données Strava.

## 🎯 Architecture Frontend Complète

### Pages Créées (11 pages)

#### Authentification
- `/` - Landing page avec présentation
- `/login` - Connexion utilisateur
- `/signup` - Inscription
- `/onboarding` - Configuration du profil (BikeTypes, préférences)

#### Dashboard Utilisateur
- `/dashboard` - Tableau de bord avec statistiques, recommandations, et bannière Strava

#### Gestion des Clubs
- `/clubs` - Liste des clubs de l'utilisateur
- `/clubs/create` - Création d'un nouveau club
- `/clubs/[id]` - Détail d'un club (stats, classement, invitations)
- `/clubs/join/[code]` - Rejoindre un club via code d'invitation

#### Ambassadeurs
- `/ambassadors` - Galerie des ambassadeurs Michelin

#### Intégration Strava
- `/strava/connect` - Connexion OAuth Strava et import d'activités

#### Administration Michelin
- `/admin` - Dashboard admin pour gérer ambassadeurs et clubs

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Backend NestJS lancé sur `http://localhost:3001`
- Compte Supabase configuré

### Installation

```bash
cd hackaton-michelin-front
npm install
```

### Configuration

Créer un fichier `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://viwlkozcralohiitwqdp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Lancement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Structure du Projet

```
hackaton-michelin-front/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── admin/page.tsx
│   ├── ambassadors/page.tsx
│   ├── clubs/
│   │   ├── page.tsx
│   │   ├── create/page.tsx
│   │   ├── [id]/page.tsx
│   │   └── join/[code]/page.tsx
│   ├── dashboard/page.tsx
│   ├── onboarding/page.tsx
│   ├── strava/connect/page.tsx
│   ├── page.tsx (landing)
│   ├── layout.tsx
│   ├── providers.tsx
│   └── globals.css
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   ├── api/
│   │   └── client.ts (Axios avec JWT interceptors)
│   ├── supabase/
│   │   ├── client.ts (Browser client)
│   │   └── server.ts (Server client)
│   └── utils.ts
└── package.json
```

## 🔐 Authentification

L'application utilise **Supabase Auth** pour l'authentification :

1. **Inscription** (`/signup`) - Création de compte
2. **Connexion** (`/login`) - Authentification
3. **Onboarding** (`/onboarding`) - Configuration du profil après inscription
4. **JWT automatique** - Le client API injecte automatiquement le token JWT dans les requêtes

