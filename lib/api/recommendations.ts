import { api } from './client';

// Backend: src/modules/recommendations/recommendations.controller.ts  (base: /recommendations)
export const recommendationsApi = {
  // GET /recommendations?bikeType=
  list: (bikeType?: string) =>
    api.get('/recommendations', { params: { bikeType } }).then((r) => r.data),
};
