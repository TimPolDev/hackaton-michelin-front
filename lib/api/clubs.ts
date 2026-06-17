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
};
