// Token sesi (JWT HS256). Tanpa API khusus Node agar bisa dipakai di proxy.ts.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sdl_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export interface SessionPayload {
  sub: string; // id admin
  email: string;
}

function key(secret: string) {
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload, secret: string) {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key(secret));
}

export async function verifySession(
  token: string | undefined,
  secret: string
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
