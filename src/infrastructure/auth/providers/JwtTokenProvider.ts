import jwt from 'jsonwebtoken';
import type { TokenProvider } from '../../../application/auth/ports/TokenProvider.js';

export class JwtTokenProvider implements TokenProvider {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string = '24h',
  ) {}

  generate(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, this.secret, {
      expiresIn: this.expiresIn,
    } as jwt.SignOptions);
  }

  verify(token: string): { id: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.secret) as { id: string; email: string };
      return { id: decoded.id, email: decoded.email };
    } catch {
      return null;
    }
  }
}
