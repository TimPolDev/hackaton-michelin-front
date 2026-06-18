import { api } from './client';
import type { ResellersQuery, Reseller } from './types';

// Backend: src/modules/resellers/resellers.controller.ts  (base: /resellers)
export const resellersApi = {
  // GET /resellers?country=&region=   (public)
  list: (params?: ResellersQuery): Promise<Reseller[]> =>
    api.get('/resellers', { params }).then((r) => r.data),

  // GET /resellers/:id   (public)
  get: (id: string): Promise<Reseller> =>
    api.get(`/resellers/${id}`).then((r) => r.data),
};
