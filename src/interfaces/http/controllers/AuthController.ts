import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import type { RegisterUser } from '../../../application/auth/use-cases/RegisterUser.js';
import type { LoginUser } from '../../../application/auth/use-cases/LoginUser.js';
import type { TokenProvider } from '../../../application/auth/ports/TokenProvider.js';
import { User } from '../../../domain/auth/User.js';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
  ValidationError,
} from '../../../domain/auth/errors.js';

export class AuthController {
  private router: Router;

  constructor(
    private registerUser: RegisterUser,
    private loginUser: LoginUser,
    private tokenProvider: TokenProvider,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  private setupRoutes(): void {
    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterRequest'
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Validation error or user already exists
     *       500:
     *         description: Server error
     */
    this.router.post('/register', this.register.bind(this));

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login with email and password
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       401:
     *         description: Invalid credentials
     *       500:
     *         description: Server error
     */
    this.router.post('/login', this.login.bind(this));

    /**
     * @swagger
     * /auth/google:
     *   get:
     *     summary: Initiate Google OAuth login
     *     tags: [Authentication]
     *     responses:
     *       302:
     *         description: Redirect to Google OAuth
     */
    this.router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    /**
     * @swagger
     * /auth/google/callback:
     *   get:
     *     summary: Google OAuth callback
     *     tags: [Authentication]
     *     responses:
     *       200:
     *         description: Google login successful
     */
    this.router.get(
      '/google/callback',
      passport.authenticate('google', {
        failureRedirect: '/auth/google/failure',
        session: false,
      }),
      this.googleCallback.bind(this),
    );

    this.router.get('/google/failure', (_req: Request, res: Response): void => {
      res.status(401).json({ success: false, message: 'Google authentication failed' });
    });
  }

  private async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.registerUser.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        ...result,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  private async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.loginUser.execute(req.body);
      res.json({
        success: true,
        message: 'Login successful',
        ...result,
      });
    } catch (error) {
      this.handleError(error, res, next);
    }
  }

  private googleCallback(req: Request, res: Response): void {
    const user = req.user as User;
    const token = this.tokenProvider.generate(user.id, user.email);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  }

  private handleError(error: unknown, res: Response, next: NextFunction): void {
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, message: error.message });
    } else if (error instanceof UserAlreadyExistsError) {
      res.status(400).json({ success: false, message: error.message });
    } else if (error instanceof InvalidCredentialsError) {
      res.status(401).json({ success: false, message: error.message });
    } else {
      next(error);
    }
  }
}
