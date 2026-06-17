import { api } from './client';
import type {
  AmbassadorsQuery,
  CreateAmbassadorPayload,
  CreateAmbassadorTirePayload,
  UpdateAmbassadorPayload,
} from './types';

// Backend: src/modules/ambassadors/ambassadors.controller.ts  (base: /ambassadors)
export const ambassadorsApi = {
  // GET /ambassadors?bikeType=&featured=   (public)
  list: (params?: AmbassadorsQuery) =>
    api.get('/ambassadors', { params }).then((r) => r.data),

  // GET /ambassadors/:id   (public)
  get: (id: string) => api.get(`/ambassadors/${id}`).then((r) => r.data),

  // POST /ambassadors   (admin)
  create: (payload: CreateAmbassadorPayload) =>
    api.post('/ambassadors', payload).then((r) => r.data),

  // PUT /ambassadors/:id   (admin)
  update: (id: string, payload: UpdateAmbassadorPayload) =>
    api.put(`/ambassadors/${id}`, payload).then((r) => r.data),

  // DELETE /ambassadors/:id   (admin)
  remove: (id: string) => api.delete(`/ambassadors/${id}`).then((r) => r.data),

  // POST /ambassadors/:id/tires   (admin)
  addTire: (id: string, payload: CreateAmbassadorTirePayload) =>
    api.post(`/ambassadors/${id}/tires`, payload).then((r) => r.data),

  // DELETE /ambassadors/:id/tires/:tireId   (admin)
  removeTire: (id: string, tireId: string) =>
    api.delete(`/ambassadors/${id}/tires/${tireId}`).then((r) => r.data),
};
