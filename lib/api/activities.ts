import { api } from './client';
import type { ActivitiesQuery } from './types';

// Backend: src/modules/activities/activities.controller.ts  (base: /activities)
export const activitiesApi = {
  // GET /activities?bikeType=&limit=&offset=
  list: (params?: ActivitiesQuery) =>
    api.get('/activities', { params }).then((r) => r.data),

  // PATCH /activities/:id   body: { bikeType }
  updateBikeType: (id: string, bikeType: string) =>
    api.patch(`/activities/${id}`, { bikeType }).then((r) => r.data),

  // --- Strava integration ---

  // GET /activities/strava/authorize-url  -> { url, state }
  stravaAuthorizeUrl: () =>
    api.get('/activities/strava/authorize-url').then((r) => r.data),

  // POST /activities/connect-strava   body: { code }
  connectStrava: (code: string) =>
    api.post('/activities/connect-strava', { code }).then((r) => r.data),

  // DELETE /activities/disconnect-strava
  disconnectStrava: () =>
    api.delete('/activities/disconnect-strava').then((r) => r.data),

  // POST /activities/sync-strava
  syncStrava: () => api.post('/activities/sync-strava').then((r) => r.data),

  // DELETE /activities/reset-activities - Delete all and reimport
  resetActivities: () =>
    api.delete('/activities/reset-activities').then((r) => r.data),
};
