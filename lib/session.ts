import 'server-only';
import { cookies } from 'next/headers';
import { kv } from './kv';
import { Role } from './types';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'session-id';
const SESSION_TTL_SECONDS = Number(
  process.env.SESSION_TTL_SECONDS || '2592000'
);

export type SessionData = {
  userId: string;
  role: Role;
};

type SessionId = string;

async function getCookieStore() {
  return await cookies();
}

export async function getSessionId(): Promise<SessionId | undefined> {
  const cookieStore = await getCookieStore();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

async function setSessionId(sessionId: SessionId) {
  const cookieStore = await getCookieStore();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    sameSite: 'lax',
  });
}

export async function clearSession() {
  const cookieStore = await getCookieStore();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await kv.del(`session:${sessionId}`);
  }

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 0,
  });
}

export async function setSession(data: SessionData) {
  const sessionId = crypto.randomUUID();
  await kv.set(`session:${sessionId}`, data, {
    ex: SESSION_TTL_SECONDS,
  });
  await setSessionId(sessionId);
}

export async function getSession(): Promise<SessionData | null> {
  const sessionId = await getSessionId();
  if (!sessionId) return null;
  const data = await kv.get<SessionData>(`session:${sessionId}`);
  return data || null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return session;
}
