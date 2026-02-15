import type { User } from '../../../domain/auth/User.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
