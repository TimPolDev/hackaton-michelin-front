import { api } from './client';
import type { CompleteProfilePayload, CurrentUser, ProfileStatus } from './types';

// Backend: src/modules/auth/auth.controller.ts  (base: /auth)
export const authApi = {
  // POST /auth/complete-profile
  completeProfile: (payload: CompleteProfilePayload) =>
    api.post('/auth/complete-profile', payload).then((r) => r.data),

  // GET /auth/profile-status
  profileStatus: () =>
    api.get<ProfileStatus>('/auth/profile-status').then((r) => r.data),

  // GET /auth/me
  me: () => api.get<CurrentUser>('/auth/me').then((r) => r.data),
};
