import { api } from './client';
import type { CyclistStatsQuery, UpdateCyclistPayload } from './types';

// Backend: src/modules/cyclists/cyclists.controller.ts  (base: /cyclists)
export const cyclistsApi = {
  // GET /cyclists  (admin only)
  list: () => api.get('/cyclists').then((r) => r.data),

  // GET /cyclists/me
  me: () => api.get('/cyclists/me').then((r) => r.data),

  // GET /cyclists/me/stats?bikeType=&period=
  stats: (params?: CyclistStatsQuery) =>
    api.get('/cyclists/me/stats', { params }).then((r) => r.data),

  // GET /cyclists/leaderboard?period=&bikeType=  (global leaderboard)
  leaderboard: (params?: { period?: string; bikeType?: string }) =>
    api.get('/cyclists/leaderboard', { params }).then((r) => r.data),

  // PATCH /cyclists/me
  updateMe: (payload: UpdateCyclistPayload) =>
    api.patch('/cyclists/me', payload).then((r) => r.data),
};
