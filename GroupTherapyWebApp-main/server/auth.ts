
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const ATTEMPT_WINDOW_MINUTES = 15;

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function createSession(username: string): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await storage.createSession({ id: sessionId, username, expiresAt });
  return sessionId;
}

export async function validateSession(sessionId: string): Promise<string | null> {
  const session = await storage.getSession(sessionId);
  if (!session) return null;
  
  if (new Date() > session.expiresAt) {
    await storage.deleteSession(sessionId);
    return null;
  }
  
  return session.username;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await storage.deleteSession(sessionId);
}

export async function isRateLimited(username: string): Promise<boolean> {
  const recentAttempts = await storage.getRecentLoginAttempts(
    username,
    ATTEMPT_WINDOW_MINUTES
  );
  
  const failedAttempts = recentAttempts.filter(attempt => !attempt.successful);
  return failedAttempts.length >= MAX_LOGIN_ATTEMPTS;
}

export async function validateCredentials(
  username: string,
  password: string,
  ipAddress?: string
): Promise<{ valid: boolean; message?: string }> {
  // Check rate limiting
  if (await isRateLimited(username)) {
    await storage.recordLoginAttempt({
      username,
      ipAddress,
      successful: false,
    });
    return {
      valid: false,
      message: `Too many failed login attempts. Please try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
    };
  }

  // Get admin user from database
  const adminUser = await storage.getAdminUserByUsername(username);
  
  if (!adminUser) {
    await storage.recordLoginAttempt({
      username,
      ipAddress,
      successful: false,
    });
    return { valid: false, message: "Invalid credentials" };
  }

  if (!adminUser.isActive) {
    await storage.recordLoginAttempt({
      username,
      ipAddress,
      successful: false,
    });
    return { valid: false, message: "Account is inactive" };
  }

  const isValid = await bcrypt.compare(password, adminUser.passwordHash);
  
  await storage.recordLoginAttempt({
    username,
    ipAddress,
    successful: isValid,
  });

  if (isValid) {
    await storage.updateAdminLastLogin(username);
    return { valid: true };
  }

  return { valid: false, message: "Invalid credentials" };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");
  
  if (!sessionId) {
    return res.status(401).json({ message: "Authentication required from auth.ts" });
  }
  
  const username = await validateSession(sessionId);
  if (!username) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
  
  (req as any).user = { username };
  next();
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  return bcrypt.hash(password, saltRounds);
}
