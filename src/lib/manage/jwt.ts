import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export type AdminTokenPayload = JWTPayload & {
  sub: string;
  username: string;
  role: string;
  type: 'admin_access' | 'admin_refresh';
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('Missing AUTH_SECRET');
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminAccessToken(payload: {
  userId: string;
  username: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    username: payload.username,
    role: payload.role,
    type: 'admin_access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getSecret());
}

export async function signAdminRefreshToken(payload: {
  userId: string;
  username: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    username: payload.username,
    role: payload.role,
    type: 'admin_refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyAdminToken(
  token: string,
  expectedType: AdminTokenPayload['type'],
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== expectedType || !payload.sub) {
      return null;
    }
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}
