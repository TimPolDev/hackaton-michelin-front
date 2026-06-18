// Shared types that mirror the backend DTOs / contracts.
// Source of truth: hackaton-michelin-back/src/modules/**/dto + controllers.

export type BikeType = 'ROAD' | 'MTB' | 'GRAVEL' | 'E_BIKE' | 'COMMUTING';

// 1..10 sliders sent at onboarding / profile update.
export interface Preferences {
  grip?: number;
  endurance?: number;
  lightness?: number;
  versatility?: number;
}

// ---- Auth ----
export interface CompleteProfilePayload {
  fullName: string;
  bikeTypes: string[];
  primaryBikeType: BikeType;
  practiceStyle?: string;
  preferences?: Preferences;
}

export interface CurrentUser {
  supabaseUserId: string;
  email: string;
  isAdmin: boolean;
}

export interface ProfileStatus {
  isComplete: boolean;
  supabaseUserId: string;
  email: string;
}

// ---- Cyclists ----
export interface UpdateCyclistPayload {
  fullName?: string;
  practiceStyle?: string;
  preferences?: Preferences;
}

export interface CyclistStatsQuery {
  bikeType?: string;
  period?: string;
}

// ---- Clubs ----
export interface CreateClubPayload {
  name: string;
  description?: string;
  isMultiBikeType: boolean;
  bikeTypeFilter?: string;
}

// ---- Ambassadors ----
export interface AmbassadorsQuery {
  bikeType?: string;
  featured?: boolean;
}

export interface CreateAmbassadorPayload {
  cyclistId: string;
  bio: string; // min 10 chars
  discipline: string;
  skillLevel: string;
  photoUrl?: string;
  photos?: string[];
  articleContent?: string;
  showRidingData?: boolean;
  featuredSegments?: string;
  isFeatured?: boolean;
  displayOrder?: number;
}

export type UpdateAmbassadorPayload = Partial<Omit<CreateAmbassadorPayload, 'cyclistId'>>;

export interface CreateAmbassadorTirePayload {
  tireId: string;
  bikeType: string;
  testimonial: string; // min 20 chars
}

// ---- Tires ----
export interface TiresQuery {
  bikeType?: string;
  segment?: string;
  terrainType?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// A physical declination of a Tire product (specific size / build).
export interface TireVariant {
  id: string;
  designation: string; // internal name
  webProductName: string; // web name
  bead?: string | null;
  eanCode?: string | null;
  widthEtrto?: string | null;
  diameterEtrto?: string | null;
  widthMm?: number | null;
  diameterMm?: number | null;
  weight?: number | null;
  minPressure?: number | null;
  maxPressure?: number | null;
  tpi?: string | null;
  terrainTypes: string;
  reinforcementTech?: string | null;
  sidewallColor?: string | null;
  treadPatternColor?: string | null;
  recommendedInnerTube?: string | null;
  isDiscontinued: boolean;
}

// A product model (one per Global ID), with its variants.
export interface Tire {
  id: string;
  globalId: string;
  brand: string;
  productType: string;
  cycleType: string;
  segment: string;
  rangeName: string; // web range name
  rangeInternal: string; // internal range name
  compatibleBikeTypes: string;
  useCases: string;
  rubberTech?: string | null;
  casingTech?: string | null;
  treadPatternTech?: string | null;
  sidewallType?: string | null;
  sealing?: string | null;
  rimType?: string | null;
  fitting?: string | null;
  terrainTypes: string; // aggregated union across variants
  minWeight?: number | null;
  isEBikeReady: boolean;
  isDiscontinued: boolean;
  images: string[]; // product gallery; first one is the card thumbnail
  variants: TireVariant[];
  ambassadors?: TireAmbassador[]; // ambassadeurs utilisant ce pneu (GET /tires/:id)
}

// Ambassadeur rattaché à un pneu, tel qu'aplati par GET /tires/:id.
export interface TireAmbassador {
  bikeType: string;
  testimonial: string;
  ambassador: {
    id: string;
    cyclist: { id: string; fullName: string | null };
    discipline: string;
    skillLevel: string;
    photoUrl?: string | null;
  };
}

export interface TiresListResponse {
  tires: Tire[];
  total: number;
}

// ---- Resellers ----
export interface ResellersQuery {
  country?: string; // FR, DE, UK...
  region?: string; // EUN | EUS | ECA
}

// An authorized retail partner selling Michelin tires.
export interface Reseller {
  id: string;
  name: string;
  region: string;
  country: string;
  website: string;
}

// ---- Activities ----
export interface ActivitiesQuery {
  bikeType?: string;
  limit?: number;
  offset?: number;
}
