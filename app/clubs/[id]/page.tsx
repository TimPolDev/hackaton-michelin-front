'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { backend } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { ClubHero } from '@/components/clubs/ClubHero';
import { ClubKpiCards } from '@/components/clubs/ClubKpiCards';
import type { ClubKpiStats } from '@/components/clubs/ClubKpiCards';
import { ClubTabs, useClubTab } from '@/components/clubs/ClubTabs';
import { ClubFeed } from '@/components/clubs/ClubFeed';
import type { FeedItem } from '@/components/clubs/ClubFeed';
import { ClubLeaderboardCard } from '@/components/clubs/ClubLeaderboardCard';
import { ClubUpcomingEvents } from '@/components/clubs/ClubUpcomingEvents';
import type { ClubEvent } from '@/components/clubs/ClubUpcomingEvents';
import { ClubUserRecommendationCard } from '@/components/clubs/ClubUserRecommendationCard';
import { ClubRoutesCard } from '@/components/clubs/ClubRoutesCard';
import type { ClubRoute } from '@/components/clubs/ClubRoutesCard';
import { ClubEventsList } from '@/components/clubs/ClubEventsList';
import { ClubRoutesList } from '@/components/clubs/ClubRoutesList';
import { PageLoader } from '@/components/ui/loader';

interface Club {
  id: string;
  name: string;
  description?: string | null;
  bikeTypes?: string[] | null;
  inviteCode?: string | null;
  createdAt?: string;
  location?: string | null;
  foundedYear?: number | null;
  memberCount?: number | null;
  isPremium?: boolean | null;
  isMichelinPartner?: boolean | null;
  stats?: {
    totalDistance?: number;
    totalElevation?: number;
    activeMemberCount?: number;  // matches back
    activityCount?: number;
    upcomingEventCount?: number; // matches back
    nextEventLabel?: string | null;
    avgElevationPerActivity?: number; // matches back
    deltas?: {
      distancePct?: number | null;
      activeMembersDelta?: number | null;
      activityDelta?: number | null;
      elevationPct?: number | null;
    } | null;
    leaderboard?: Array<{
      cyclist: { id: string; fullName: string };
      distance: number;
      elevation?: number | null;
    }>;
  } | null;
}

// ---------------------------------------------------------------------------
// Helper: build KPI stats from the raw club.stats returned by GET /clubs/:id
// ---------------------------------------------------------------------------
function buildKpiStats(club: Club | null): ClubKpiStats | null {
  if (!club?.stats) return null;
  const s = club.stats;
  const d = s.deltas;
  return {
    totalDistanceKm: s.totalDistance != null ? Math.round(s.totalDistance) : null,
    activeMembers: s.activeMemberCount ?? club.memberCount ?? null,
    ridesThisMonth: s.activityCount ?? null,
    upcomingEvents: s.upcomingEventCount ?? null,
    avgElevationPerRide: s.avgElevationPerActivity ?? null,
    totalDistanceDelta: d?.distancePct != null ? `▲ +${d.distancePct}%` : null,
    activeMembersDelta: d?.activeMembersDelta != null ? `▲ +${d.activeMembersDelta} ce mois` : null,
    ridesDelta: d?.activityDelta != null ? `▲ +${d.activityDelta}` : null,
    upcomingEventsLabel: s.nextEventLabel ?? null,
    avgElevationDelta: d?.elevationPct != null ? `▲ +${d.elevationPct}%` : null,
  };
}

// ---------------------------------------------------------------------------
// Invite modal (inline — lightweight, no extra dep)
// ---------------------------------------------------------------------------
function InviteModal({
  club,
  onClose,
}: {
  club: Club;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const extractMessage = (err: any) => {
      const m =
        err?.response?.data?.message ||
        err?.message ||
        "Impossible de générer un lien d'invitation.";
      return Array.isArray(m) ? m.join('\n') : m;
    };

    backend.clubs.invitations(club.id)
      .then((invitations: any[]) => {
        const list = Array.isArray(invitations) ? invitations : [];
        const now = new Date();
        const active = list.find(
          (inv) => !inv.isRevoked && new Date(inv.expiresAt) > now,
        );
        if (active) {
          setToken(active.token);
          return;
        }
        return backend.clubs.createInvitation(club.id, 30).then((inv: any) => {
          setToken(inv.token);
        });
      })
      .catch((err) => {
        setToken(null);
        setError(extractMessage(err));
      })
      .finally(() => setTokenLoading(false));
  }, [club.id]);

  const inviteLink =
    typeof window !== 'undefined' && token
      ? `${window.location.origin}/clubs/join/${token}`
      : '';

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">Inviter des membres</h2>
        {tokenLoading ? (
          <p className="text-sm text-muted-foreground">Chargement du lien…</p>
        ) : token ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Lien d'invitation</label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly />
                <Button onClick={() => copy(inviteLink)}>
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Code d'invitation</label>
              <div className="flex gap-2">
                <Input value={token} readOnly />
                <Button onClick={() => copy(token)}>
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500 whitespace-pre-line">
            {error ?? "Impossible de générer un lien d'invitation. Vérifiez que vous êtes manager du club."}
          </p>
        )}
        <Button variant="ghost" className="mt-4 w-full" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params?.id as string;

  const [activeTab, setActiveTab] = useClubTab();

  // Core data
  const [club, setClub] = useState<Club | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  // Feed
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  // Sidebar
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [routes, setRoutes] = useState<ClubRoute[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Full tab lists (Calendrier / Itinéraires)
  const [allEvents, setAllEvents] = useState<ClubEvent[]>([]);
  const [allEventsLoading, setAllEventsLoading] = useState(false);
  const [allRoutes, setAllRoutes] = useState<ClubRoute[]>([]);
  const [allRoutesLoading, setAllRoutesLoading] = useState(false);

  // UI state
  const [inviteOpen, setInviteOpen] = useState(false);

  // ------------------------------------------------------------------
  // Load core club data
  // ------------------------------------------------------------------
  const loadClubData = useCallback(async () => {
    if (!clubId) return;
    try {
      setLoading(true);
      const [clubData, cyclistData] = await Promise.all([
        backend.clubs.get(clubId),
        backend.cyclists.me(),
      ]);

      // Compose location from city + region if back sends them separately
      const enriched = {
        ...clubData,
        location:
          clubData.location ??
          ([clubData.city, clubData.region].filter(Boolean).join(', ') || null),
      };
      setClub(enriched);

      const membership = cyclistData.clubMemberships?.find(
        (m: any) => m.club?.id === clubId || m.clubId === clubId
      );
      setIsManager(membership?.isManager ?? false);
    } catch (err) {
      console.error('Error loading club:', err);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  // ------------------------------------------------------------------
  // Load feed (called once on mount and when feed tab is active)
  // ------------------------------------------------------------------
  const loadFeed = useCallback(async () => {
    if (!clubId) return;
    setFeedLoading(true);
    try {
      const data = await backend.clubs.feed(clubId, 20);
      setFeedItems(Array.isArray(data) ? data : []);
    } catch {
      setFeedItems([]);
    } finally {
      setFeedLoading(false);
    }
  }, [clubId]);

  // ------------------------------------------------------------------
  // Load sidebar data (events, user recommendation, routes)
  // ------------------------------------------------------------------
  const loadSidebar = useCallback(async () => {
    if (!clubId) return;

    setEventsLoading(true);
    try {
      const eventsData = await backend.clubs.events(clubId, { upcoming: true, limit: 3 });
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }

    setRecommendationLoading(true);
    try {
      const recsData = await backend.recommendations.list();
      setRecommendation(recsData?.recommendations?.[0] || null);
    } catch {
      setRecommendation(null);
    } finally {
      setRecommendationLoading(false);
    }

    try {
      const routesData = await backend.clubs.routes(clubId, 3);
      setRoutes(Array.isArray(routesData) ? routesData : []);
    } catch {
      setRoutes([]);
    }
  }, [clubId]);

  // ------------------------------------------------------------------
  // Load members data
  // ------------------------------------------------------------------
  const loadMembers = useCallback(async () => {
    if (!clubId) return;
    setMembersLoading(true);
    try {
      const membersData = await backend.clubs.members(clubId);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [clubId]);

  // ------------------------------------------------------------------
  // Load full lists for the Calendrier / Itinéraires tabs
  // ------------------------------------------------------------------
  const loadAllEvents = useCallback(async () => {
    if (!clubId) return;
    setAllEventsLoading(true);
    try {
      const data = await backend.clubs.events(clubId, { upcoming: true, limit: 50 });
      setAllEvents(Array.isArray(data) ? data : []);
    } catch {
      setAllEvents([]);
    } finally {
      setAllEventsLoading(false);
    }
  }, [clubId]);

  const loadAllRoutes = useCallback(async () => {
    if (!clubId) return;
    setAllRoutesLoading(true);
    try {
      const data = await backend.clubs.routes(clubId, 50);
      setAllRoutes(Array.isArray(data) ? data : []);
    } catch {
      setAllRoutes([]);
    } finally {
      setAllRoutesLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    loadClubData();
    loadFeed();
    loadSidebar();
  }, [loadClubData, loadFeed, loadSidebar]);

  // Load members when membres tab is active
  useEffect(() => {
    if (activeTab === 'membres') {
      loadMembers();
    }
  }, [activeTab, loadMembers]);

  // Load full lists when their tab is active
  useEffect(() => {
    if (activeTab === 'calendrier') loadAllEvents();
    if (activeTab === 'itineraires') loadAllRoutes();
  }, [activeTab, loadAllEvents, loadAllRoutes]);

  // ------------------------------------------------------------------
  // Event join / leave
  // ------------------------------------------------------------------
  const handleJoinEvent = async (eventId: string, joining: boolean) => {
    try {
      if (joining) {
        await backend.clubs.joinEvent(eventId);
      } else {
        await backend.clubs.leaveEvent(eventId);
      }
      const sync = (prev: ClubEvent[]) =>
        prev.map((e) => (e.id === eventId ? { ...e, isJoined: joining } : e));
      setEvents(sync);
      setAllEvents(sync);
    } catch (err) {
      console.error('Error joining/leaving event:', err);
    }
  };

  // ------------------------------------------------------------------
  // Leave club
  // ------------------------------------------------------------------
  const handleLeaveClub = async () => {
    if (!confirm('Êtes-vous sûr de vouloir quitter ce club ?')) return;
    try {
      await backend.clubs.leave(clubId);
      router.push('/clubs');
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Impossible de quitter le club pour le moment. Réessayez plus tard.';
      alert(Array.isArray(apiMessage) ? apiMessage.join('\n') : apiMessage);
    }
  };

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  if (loading) {
    return <PageLoader text="Chargement du club" />;
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Club introuvable</h2>
          <Button onClick={() => router.push('/clubs')}>Retour aux clubs</Button>
        </div>
      </div>
    );
  }

  const kpiStats = buildKpiStats(club);

  return (
    <>
      {inviteOpen && (
        <InviteModal club={club} onClose={() => setInviteOpen(false)} />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push('/clubs')}
          >
            ← Mes clubs
          </Button>

          {/* Hero */}
          <ClubHero
            club={club}
            isManager={isManager}
            onManage={() => router.push(`/clubs/${clubId}/manage`)}
            onInvite={() => setInviteOpen(true)}
          />

          {/* KPI cards */}
          <div className="mt-6">
            <ClubKpiCards stats={kpiStats} />
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <ClubTabs active={activeTab} onChange={setActiveTab} />
          </div>

          {/* Main + sidebar grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* ── Main column (2/3) ── */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'feed' && (
                <>
                  <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Activité récente
                    </h2>
                    <ClubFeed items={feedItems} loading={feedLoading} />
                  </div>

                  {/* Inline leaderboard preview in feed tab */}
                  {club.stats?.leaderboard && club.stats.leaderboard.length > 0 && (
                    <ClubLeaderboardCard
                      entries={club.stats.leaderboard}
                      onViewAll={() => setActiveTab('classement')}
                    />
                  )}
                </>
              )}

              {activeTab === 'classement' && (
                <ClubLeaderboardCard
                  entries={club.stats?.leaderboard ?? []}
                  onViewAll={undefined}
                />
              )}

              {activeTab === 'itineraires' && (
                <ClubRoutesList routes={allRoutes} loading={allRoutesLoading} />
              )}

              {activeTab === 'calendrier' && (
                <ClubEventsList
                  events={allEvents}
                  loading={allEventsLoading}
                  onJoin={handleJoinEvent}
                />
              )}

              {activeTab === 'membres' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#27509B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Membres du club
                    </CardTitle>
                    <CardDescription>
                      {members.length} membre{members.length > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {membersLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : members.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Aucun membre pour le moment
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#27509B] to-[#FCE500] flex items-center justify-center text-white font-bold">
                                {member.cyclist?.fullName?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {member.cyclist?.fullName || 'Membre anonyme'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR', {
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            {member.isManager && (
                              <span className="px-3 py-1 bg-[#FCE500] text-[#27509B] text-xs font-bold rounded-full">
                                Manager
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ── Sidebar (1/3) ── */}
            <div className="space-y-6">
              <ClubUpcomingEvents
                events={events}
                loading={eventsLoading}
                onJoin={handleJoinEvent}
                onViewAll={() => setActiveTab('calendrier')}
              />

              <ClubUserRecommendationCard
                recommendation={recommendation}
                loading={recommendationLoading}
                onViewDetails={(tireId) => router.push(`/tires/${tireId}`)}
              />

              <ClubRoutesCard
                routes={routes}
                onViewAll={() => setActiveTab('itineraires')}
              />

              {/* Leave club */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Paramètres du club</CardTitle>
                  <CardDescription>Actions sur votre appartenance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={handleLeaveClub}
                  >
                    Quitter le club
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
