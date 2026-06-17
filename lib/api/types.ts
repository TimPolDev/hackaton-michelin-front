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
  useCase?: string;
  terrainType?: string;
  search?: string;
}

// ---- Activities ----
export interface ActivitiesQuery {
  bikeType?: string;
  limit?: number;
  offset?: number;
}
