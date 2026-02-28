import type { RefreshSession } from '../../../domain/auth/RefreshSession.js';

export interface RefreshSessionRepository {
  save(session: RefreshSession): Promise<RefreshSession>;
  findByTokenHash(tokenHash: string): Promise<RefreshSession | null>;
  /** Atomically finds a session by token hash and marks it revoked in one DB operation.
   *  Returns the pre-update session (revoked reflects its state before this call),
   *  or null if no session with that hash exists. */
  findByTokenHashAndRevoke(tokenHash: string): Promise<RefreshSession | null>;
  revokeById(id: string): Promise<void>;
  revokeByFamily(tokenFamily: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
}
