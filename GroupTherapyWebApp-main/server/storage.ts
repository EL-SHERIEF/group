import { type User, type InsertUser, type AdminUser, type InsertAdminUser, type InsertLoginAttempt, type LoginAttempt, type Release, type InsertRelease, type Event, type InsertEvent, type Post, type InsertPost, type Contact, type InsertContact, type Artist, type InsertArtist, type RadioShow, type InsertRadioShow, type Playlist, type InsertPlaylist, type Video, type InsertVideo, type Session, type InsertSession, type PageView, type InsertPageView, type PlayCount, type InsertPlayCount, type RadioListener, type InsertRadioListener, type RadioSettings } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Admin user methods
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminLastLogin(username: string): Promise<void>;

  // Login attempt tracking
  recordLoginAttempt(attempt: InsertLoginAttempt): Promise<LoginAttempt>;
  getRecentLoginAttempts(username: string, minutes: number): Promise<LoginAttempt[]>;

  // Releases
  getAllReleases(): Promise<Release[]>;
  getReleaseById(id: string): Promise<Release | undefined>;
  createRelease(release: InsertRelease): Promise<Release>;
  updateRelease(id: string, release: Partial<Release>): Promise<Release>;
  deleteRelease(id: string): Promise<void>;

  // Events
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<Event>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;

  // Posts
  getAllPosts(): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<Post>): Promise<Post>;
  deletePost(id: string): Promise<void>;

  // Contacts
  getAllContacts(): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: string, contact: Partial<Contact>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;

  // Artists
  getAllArtists(): Promise<Artist[]>;
  getArtistById(id: string): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: string, artist: Partial<Artist>): Promise<Artist>;
  deleteArtist(id: string): Promise<void>;

  // Radio Shows
  getAllRadioShows(): Promise<RadioShow[]>;
  getRadioShowById(id: string): Promise<RadioShow | undefined>;
  createRadioShow(show: InsertRadioShow): Promise<RadioShow>;
  updateRadioShow(id: string, show: Partial<RadioShow>): Promise<RadioShow>;
  deleteRadioShow(id: string): Promise<void>;

  // Playlists
  getAllPlaylists(): Promise<Playlist[]>;
  getPlaylistById(id: string): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, playlist: Partial<Playlist>): Promise<Playlist>;
  deletePlaylist(id: string): Promise<void>;

  // Videos
  getAllVideos(): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: Partial<Video>): Promise<Video>;
  deleteVideo(id: string): Promise<void>;

  // Sessions
  createSession(session: { id: string; username: string; expiresAt: Date }): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  deleteSession(id: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;

  // Radio Settings
  getRadioSettings(): Promise<RadioSettings | undefined>;
  updateRadioSettings(settings: Partial<RadioSettings>): Promise<RadioSettings>;
  initRadioSettings(): Promise<RadioSettings>;

  // Analytics
  recordPageView(view: InsertPageView): Promise<PageView>;
  recordPlayCount(playCount: InsertPlayCount): Promise<PlayCount>;
  recordRadioListener(listener: InsertRadioListener): Promise<RadioListener>;
  updateRadioListenerEnd(id: string): Promise<void>;
  getAnalyticsOverview(): Promise<{
    totalPageViews: number;
    totalPlayCounts: number;
    totalRadioListeners: number;
    recentPageViews: PageView[];
    topReleasesByPlays: { releaseId: string; playCount: number }[];
  }>;
}

// Use PostgreSQL database storage only
import { DatabaseStorage } from "./db-storage";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required. Please configure your database connection.");
}

console.log("Using PostgreSQL database storage");
export const storage = new DatabaseStorage(process.env.DATABASE_URL);

// Ensure database connection is initialized
export async function ensureStorageInitialized() {
  try {
    // Test database connection with a simple query
    await storage.getAllReleases();
    console.log("Storage connection verified");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Failed to connect to database");
  }
}
