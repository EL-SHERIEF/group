
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, lt, desc, sql, count } from "drizzle-orm";
import type { IStorage } from "./storage";
import type { User, InsertUser, AdminUser, InsertAdminUser, InsertLoginAttempt, LoginAttempt, Release, InsertRelease, Event, InsertEvent, Post, InsertPost, Contact, InsertContact, Artist, InsertArtist, RadioShow, InsertRadioShow, Playlist, InsertPlaylist, Video, InsertVideo, Session, InsertSession, PageView, InsertPageView, PlayCount, InsertPlayCount, RadioListener, InsertRadioListener, RadioSettings } from "@shared/schema";
import * as schema from "@shared/schema";

export class DatabaseStorage implements IStorage {
  private db;
  private pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('supabase') || databaseUrl.includes('neon') 
        ? { rejectUnauthorized: false } 
        : undefined
    });
    this.db = drizzle(this.pool, { schema });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // Admin users
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const result = await this.db.select().from(schema.adminUsers).where(eq(schema.adminUsers.username, username));
    return result[0];
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const result = await this.db.insert(schema.adminUsers).values(user).returning();
    return result[0];
  }

  async updateAdminLastLogin(username: string): Promise<void> {
    await this.db.update(schema.adminUsers)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.adminUsers.username, username));
  }

  // Login attempts
  async recordLoginAttempt(attempt: InsertLoginAttempt): Promise<LoginAttempt> {
    const result = await this.db.insert(schema.loginAttempts).values(attempt).returning();
    return result[0];
  }

  async getRecentLoginAttempts(username: string, minutes: number): Promise<LoginAttempt[]> {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return await this.db.select().from(schema.loginAttempts)
      .where(eq(schema.loginAttempts.username, username));
  }

  // Releases
  async getAllReleases(): Promise<Release[]> {
    return await this.db.select().from(schema.releases);
  }

  async getReleaseById(id: string): Promise<Release | undefined> {
    const result = await this.db.select().from(schema.releases).where(eq(schema.releases.id, id));
    return result[0];
  }

  async createRelease(release: InsertRelease): Promise<Release> {
    const result = await this.db.insert(schema.releases).values(release).returning();
    return result[0];
  }

  async updateRelease(id: string, update: Partial<Release>): Promise<Release> {
    const result = await this.db.update(schema.releases).set(update).where(eq(schema.releases.id, id)).returning();
    return result[0];
  }

  async deleteRelease(id: string): Promise<void> {
    await this.db.delete(schema.releases).where(eq(schema.releases.id, id));
  }

  // Events
  async getAllEvents(): Promise<Event[]> {
    return await this.db.select().from(schema.events);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const result = await this.db.select().from(schema.events).where(eq(schema.events.id, id));
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await this.db.insert(schema.events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: string, update: Partial<Event>): Promise<Event> {
    const result = await this.db.update(schema.events).set(update).where(eq(schema.events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<void> {
    await this.db.delete(schema.events).where(eq(schema.events.id, id));
  }

  // Posts
  async getAllPosts(): Promise<Post[]> {
    return await this.db.select().from(schema.posts);
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const result = await this.db.select().from(schema.posts).where(eq(schema.posts.id, id));
    return result[0];
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await this.db.insert(schema.posts).values(post).returning();
    return result[0];
  }

  async updatePost(id: string, update: Partial<Post>): Promise<Post> {
    const result = await this.db.update(schema.posts).set(update).where(eq(schema.posts.id, id)).returning();
    return result[0];
  }

  async deletePost(id: string): Promise<void> {
    await this.db.delete(schema.posts).where(eq(schema.posts.id, id));
  }

  // Contacts
  async getAllContacts(): Promise<Contact[]> {
    return await this.db.select().from(schema.contacts);
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    const result = await this.db.select().from(schema.contacts).where(eq(schema.contacts.id, id));
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await this.db.insert(schema.contacts).values(contact).returning();
    return result[0];
  }

  async updateContact(id: string, update: Partial<Contact>): Promise<Contact> {
    const result = await this.db.update(schema.contacts).set(update).where(eq(schema.contacts.id, id)).returning();
    return result[0];
  }

  async deleteContact(id: string): Promise<void> {
    await this.db.delete(schema.contacts).where(eq(schema.contacts.id, id));
  }

  // Artists
  async getAllArtists(): Promise<Artist[]> {
    return await this.db.select().from(schema.artists);
  }

  async getArtistById(id: string): Promise<Artist | undefined> {
    const result = await this.db.select().from(schema.artists).where(eq(schema.artists.id, id));
    return result[0];
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const result = await this.db.insert(schema.artists).values({
      name: artist.name,
      slug: artist.slug,
      bio: artist.bio,
      imageUrl: artist.imageUrl,
      spotifyArtistId: artist.spotifyArtistId,
      socialLinks: artist.socialLinks ?? null,
      featured: artist.featured,
    }).returning();
    return result[0];
  }

  async updateArtist(id: string, update: Partial<Artist>): Promise<Artist> {
    const result = await this.db.update(schema.artists).set(update).where(eq(schema.artists.id, id)).returning();
    return result[0];
  }

  async deleteArtist(id: string): Promise<void> {
    await this.db.delete(schema.artists).where(eq(schema.artists.id, id));
  }

  // Radio Shows
  async getAllRadioShows(): Promise<RadioShow[]> {
    return await this.db.select().from(schema.radioShows);
  }

  async getRadioShowById(id: string): Promise<RadioShow | undefined> {
    const result = await this.db.select().from(schema.radioShows).where(eq(schema.radioShows.id, id));
    return result[0];
  }

  async createRadioShow(show: InsertRadioShow): Promise<RadioShow> {
    const result = await this.db.insert(schema.radioShows).values(show).returning();
    return result[0];
  }

  async updateRadioShow(id: string, update: Partial<RadioShow>): Promise<RadioShow> {
    const result = await this.db.update(schema.radioShows).set(update).where(eq(schema.radioShows.id, id)).returning();
    return result[0];
  }

  async deleteRadioShow(id: string): Promise<void> {
    await this.db.delete(schema.radioShows).where(eq(schema.radioShows.id, id));
  }

  // Playlists
  async getAllPlaylists(): Promise<Playlist[]> {
    return await this.db.select().from(schema.playlists);
  }

  async getPlaylistById(id: string): Promise<Playlist | undefined> {
    const result = await this.db.select().from(schema.playlists).where(eq(schema.playlists.id, id));
    return result[0];
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const result = await this.db.insert(schema.playlists).values(playlist).returning();
    return result[0];
  }

  async updatePlaylist(id: string, update: Partial<Playlist>): Promise<Playlist> {
    const result = await this.db.update(schema.playlists).set(update).where(eq(schema.playlists.id, id)).returning();
    return result[0];
  }

  async deletePlaylist(id: string): Promise<void> {
    await this.db.delete(schema.playlists).where(eq(schema.playlists.id, id));
  }

  // Videos
  async getAllVideos(): Promise<Video[]> {
    return await this.db.select().from(schema.videos);
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    const result = await this.db.select().from(schema.videos).where(eq(schema.videos.id, id));
    return result[0];
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const result = await this.db.insert(schema.videos).values(video).returning();
    return result[0];
  }

  async updateVideo(id: string, update: Partial<Video>): Promise<Video> {
    const result = await this.db.update(schema.videos).set(update).where(eq(schema.videos.id, id)).returning();
    return result[0];
  }

  async deleteVideo(id: string): Promise<void> {
    await this.db.delete(schema.videos).where(eq(schema.videos.id, id));
  }

  // Sessions
  async createSession(session: { id: string; username: string; expiresAt: Date }): Promise<Session> {
    const result = await this.db.insert(schema.sessions).values({
      id: session.id,
      username: session.username,
      expiresAt: session.expiresAt,
    }).returning();
    return result[0];
  }

  async getSession(id: string): Promise<Session | undefined> {
    const result = await this.db.select().from(schema.sessions).where(eq(schema.sessions.id, id));
    return result[0];
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  }

  // Radio Settings
  async getRadioSettings(): Promise<RadioSettings | undefined> {
    const result = await this.db.select().from(schema.radioSettings);
    return result[0];
  }

  async updateRadioSettings(settings: Partial<RadioSettings>): Promise<RadioSettings> {
    const existing = await this.getRadioSettings();
    if (!existing) {
      throw new Error("Radio settings not initialized");
    }
    const result = await this.db.update(schema.radioSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(schema.radioSettings.id, existing.id))
      .returning();
    return result[0];
  }

  async initRadioSettings(): Promise<RadioSettings> {
    const existing = await this.getRadioSettings();
    if (existing) {
      return existing;
    }
    const result = await this.db.insert(schema.radioSettings).values({
      stationName: "GroupTherapy Radio",
      isLive: false,
      listenerCount: 0,
    }).returning();
    return result[0];
  }

  // Analytics
  async recordPageView(view: InsertPageView): Promise<PageView> {
    const result = await this.db.insert(schema.pageViews).values(view).returning();
    return result[0];
  }

  async recordPlayCount(playCount: InsertPlayCount): Promise<PlayCount> {
    const result = await this.db.insert(schema.playCounts).values(playCount).returning();
    return result[0];
  }

  async recordRadioListener(listener: InsertRadioListener): Promise<RadioListener> {
    const result = await this.db.insert(schema.radioListeners).values(listener).returning();
    return result[0];
  }

  async updateRadioListenerEnd(id: string): Promise<void> {
    const listener = await this.db.select().from(schema.radioListeners).where(eq(schema.radioListeners.id, id));
    if (listener[0]) {
      const startedAt = listener[0].startedAt;
      const endedAt = new Date();
      const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
      await this.db.update(schema.radioListeners)
        .set({ endedAt, duration })
        .where(eq(schema.radioListeners.id, id));
    }
  }

  async getAnalyticsOverview(): Promise<{
    totalPageViews: number;
    totalPlayCounts: number;
    totalRadioListeners: number;
    recentPageViews: PageView[];
    topReleasesByPlays: { releaseId: string; playCount: number }[];
  }> {
    const [pageViewsCount] = await this.db.select({ count: count() }).from(schema.pageViews);
    const [playCountsCount] = await this.db.select({ count: count() }).from(schema.playCounts);
    const [radioListenersCount] = await this.db.select({ count: count() }).from(schema.radioListeners);

    const recentPageViews = await this.db.select()
      .from(schema.pageViews)
      .orderBy(desc(schema.pageViews.viewedAt))
      .limit(10);

    const topReleases = await this.db.select({
      releaseId: schema.playCounts.releaseId,
      playCount: count(),
    })
      .from(schema.playCounts)
      .groupBy(schema.playCounts.releaseId)
      .orderBy(desc(count()))
      .limit(10);

    return {
      totalPageViews: pageViewsCount.count,
      totalPlayCounts: playCountsCount.count,
      totalRadioListeners: radioListenersCount.count,
      recentPageViews,
      topReleasesByPlays: topReleases.map(r => ({
        releaseId: r.releaseId || '',
        playCount: r.playCount,
      })),
    };
  }
}
