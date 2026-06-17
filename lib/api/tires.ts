import { api } from './client';
import type { TiresQuery } from './types';

// Backend: src/modules/tires/tires.controller.ts  (base: /tires)
export const tiresApi = {
  // GET /tires?bikeType=&useCase=&terrainType=&search=   (public)
  list: (params?: TiresQuery) =>
    api.get('/tires', { params }).then((r) => r.data),

  // GET /tires/:id   (public)
  get: (id: string) => api.get(`/tires/${id}`).then((r) => r.data),
};
