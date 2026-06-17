import { api } from './client';
import type { TiresQuery, Tire, TiresListResponse } from './types';

// Backend: src/modules/tires/tires.controller.ts  (base: /tires)
export const tiresApi = {
  // GET /tires?bikeType=&useCase=&terrainType=&search=   (public)
  list: (params?: TiresQuery): Promise<TiresListResponse> =>
    api.get('/tires', { params }).then((r) => r.data),

  // GET /tires/:id   (public) — product with its variants
  get: (id: string): Promise<Tire> =>
    api.get(`/tires/${id}`).then((r) => r.data),
};
