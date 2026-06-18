import { api } from './client';
import type { CreateClubPayload } from './types';

// Backend: src/modules/clubs/clubs.controller.ts  (base: /clubs)
export const clubsApi = {
  // POST /clubs
  create: (payload: CreateClubPayload) =>
    api.post('/clubs', payload).then((r) => r.data),

  // GET /clubs/:id
  get: (id: string) => api.get(`/clubs/${id}`).then((r) => r.data),

  // GET /clubs/:id/members
  members: (id: string) => api.get(`/clubs/${id}/members`).then((r) => r.data),

  // POST /clubs/:id/join   body: { invitationToken }
  join: (id: string, invitationToken: string) =>
    api.post(`/clubs/${id}/join`, { invitationToken }).then((r) => r.data),

  // Rejoindre via un simple token d'invitation. Le back résout le club à partir
  // du token et ignore le :id du path, donc on y place le token. Retourne
  // { alreadyMember, club }.
  joinByToken: (invitationToken: string) =>
    api
      .post(`/clubs/${invitationToken}/join`, { invitationToken })
      .then((r) => r.data),

  // POST /clubs/:id/invitations   body: { expiresInDays? }
  createInvitation: (id: string, expiresInDays?: number) =>
    api.post(`/clubs/${id}/invitations`, { expiresInDays }).then((r) => r.data),

  // GET /clubs/:id/invitations
  invitations: (id: string) =>
    api.get(`/clubs/${id}/invitations`).then((r) => r.data),

  // DELETE /clubs/:id/invitations/:invitationId
  revokeInvitation: (id: string, invitationId: string) =>
    api.delete(`/clubs/${id}/invitations/${invitationId}`).then((r) => r.data),

  // DELETE /clubs/:id
  remove: (id: string) => api.delete(`/clubs/${id}`).then((r) => r.data),

  // DELETE /clubs/:id/leave  — quitter le club en tant que membre
  leave: (id: string) => api.delete(`/clubs/${id}/leave`).then((r) => r.data),

  // GET /clubs/:id/feed?limit=N
  // Returns FeedItem[]  { id, type: 'RIDE'|'ROUTE_SHARED'|'EVENT_JOINED', ... }
  feed: (id: string, limit = 20) =>
    api.get(`/clubs/${id}/feed`, { params: { limit } }).then((r) => r.data),

  // GET /clubs/:id/events?upcoming=true&limit=N
  events: (id: string, opts: { upcoming?: boolean; limit?: number } = {}) =>
    api.get(`/clubs/${id}/events`, { params: opts }).then((r) => r.data),

  // POST /events/:eventId/join
  joinEvent: (eventId: string) =>
    api.post(`/events/${eventId}/join`).then((r) => r.data),

  // DELETE /events/:eventId/join
  leaveEvent: (eventId: string) =>
    api.delete(`/events/${eventId}/join`).then((r) => r.data),

  // GET /clubs/:id/routes?limit=N
  routes: (id: string, limit = 10) =>
    api.get(`/clubs/${id}/routes`, { params: { limit } }).then((r) => r.data),

  // GET /clubs/:id/tire-renewals
  tireRenewals: (id: string) =>
    api.get(`/clubs/${id}/tire-renewals`).then((r) => r.data),
};
