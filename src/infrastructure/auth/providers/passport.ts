import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { User } from '../../../domain/auth/User.js';
import type { UserRepository } from '../../../application/auth/ports/UserRepository.js';

export function configurePassport(
  googleConfig: { clientId: string; clientSecret: string; callbackUrl: string },
  userRepo: UserRepository,
): void {
  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await userRepo.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  if (googleConfig.clientId && googleConfig.clientSecret && googleConfig.callbackUrl) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleConfig.clientId,
          clientSecret: googleConfig.clientSecret,
          callbackURL: googleConfig.callbackUrl,
        },
        async (
          _accessToken: string,
          _refreshToken: string,
          profile: Profile,
          done: VerifyCallback,
        ) => {
          try {
            if (!profile.emails || profile.emails.length === 0) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            const email = profile.emails[0]?.value;
            if (!email) {
              return done(new Error('Invalid email in Google profile'), undefined);
            }

            // Check if user already exists by Google ID
            let user = await userRepo.findByGoogleId(profile.id);
            if (user) {
              return done(null, user);
            }

            // Check if email already exists (link Google account)
            user = await userRepo.findByEmail(email);
            if (user) {
              const updated = new User(
                user.id,
                user.email,
                user.getPasswordHash(),
                user.name || profile.displayName,
                profile.id,
                user.createdAt,
              );
              const saved = await userRepo.update(updated);
              return done(null, saved);
            }

            // Create new user
            const newUser = new User('', email, '', profile.displayName, profile.id);
            const saved = await userRepo.save(newUser);
            done(null, saved);
          } catch (error) {
            done(error as Error, undefined);
          }
        },
      ),
    );
  }
}

export default passport;
