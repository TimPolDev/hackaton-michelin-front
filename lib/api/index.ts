// Single entry-point for every backend call used by the front.
// Usage:  import { backend } from '@/lib/api';
//         const me = await backend.auth.me();
//
// Each domain maps 1:1 to a NestJS controller in hackaton-michelin-back.
// Add new endpoints in the matching domain file, never call axios directly
// from a component.

export * from './types';

import { authApi } from './auth';
import { cyclistsApi } from './cyclists';
import { clubsApi } from './clubs';
import { ambassadorsApi } from './ambassadors';
import { tiresApi } from './tires';
import { activitiesApi } from './activities';
import { recommendationsApi } from './recommendations';

export const backend = {
  auth: authApi,
  cyclists: cyclistsApi,
  clubs: clubsApi,
  ambassadors: ambassadorsApi,
  tires: tiresApi,
  activities: activitiesApi,
  recommendations: recommendationsApi,
};

// Named re-exports if you prefer importing a single domain.
export {
  authApi,
  cyclistsApi,
  clubsApi,
  ambassadorsApi,
  tiresApi,
  activitiesApi,
  recommendationsApi,
};
