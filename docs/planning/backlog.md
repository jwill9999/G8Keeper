# Project Backlog

Features, improvements, and tasks planned for future development.

**Total Items:** 23 | **High:** 3 | **Medium:** 5 | **Low:** 4 | **SaaS Platform:** 6 phases | **Tech Debt:** 4

---

## Quick Reference

### SaaS Platform — Phased Build Plan

> Multi-tenant auth SaaS (like Auth0/Clerk). Six phases, each independently releasable. See [plan details](#-saas-auth-platform---phased-build-plan) below.

| Phase | Feature                                | Priority  | Effort | Status     | Details                                             |
| ----- | -------------------------------------- | --------- | ------ | ---------- | --------------------------------------------------- |
| 1     | RS256 Migration + JWKS Endpoint        | 🔴 High   | Medium | 📋 Planned | [↓](#phase-1--rs256-migration--jwks)                |
| 2     | Redis Infrastructure + Token Denylist  | 🔴 High   | Medium | 📋 Planned | [↓](#phase-2--redis-infrastructure--token-denylist) |
| 3     | Organisation, Application & User Model | 🔴 High   | Large  | 📋 Planned | [↓](#phase-3--organisation-application--user-model) |
| 4     | Config Portal API (per Application)    | 🟡 Medium | Medium | 📋 Planned | [↓](#phase-4--config-portal-api)                    |
| 5     | Introspection & Revocation Endpoints   | 🟡 Medium | Medium | 📋 Planned | [↓](#phase-5--introspection--revocation-endpoints)  |
| 6     | Documentation & Planning Updates       | 🟡 Medium | Small  | 📋 Planned | [↓](#phase-6--documentation--planning-updates)      |

### Standalone Features

| #   | Feature                               | Priority      | Effort     | Est. Time  | Status                          | Details                                 |
| --- | ------------------------------------- | ------------- | ---------- | ---------- | ------------------------------- | --------------------------------------- |
| 1   | ~~Rate Limiting Middleware~~          | ~~🔴 High~~   | ~~Small~~  | ~~2-4h~~   | ✅ Done                         | [↓](#rate-limiting-middleware)          |
| 2   | ~~Refresh Token Implementation~~      | ~~🔴 High~~   | ~~Medium~~ | ~~8-12h~~  | ✅ Done                         | [↓](#refresh-token-implementation)      |
| 2a  | Frontend Auth Integration             | 🔴 High       | Medium     | 6-10h      | 📋 Planned                      | [↓](#frontend-auth-integration)         |
| 3   | ~~Email Verification~~                | ~~🔴 High~~   | ~~Large~~  | ~~16-20h~~ | 🔀 Absorbed → Phase 3f          | [↓](#email-verification)                |
| 4   | ~~Automated Testing Suite~~           | ~~🟡 Medium~~ | ~~Large~~  | ~~20-30h~~ | ✅ Done                         | [↓](#automated-testing-suite)           |
| 5   | Password Reset Flow                   | 🟡 Medium     | Medium     | 10-14h     | 📋 Planned                      | [↓](#password-reset-flow)               |
| 6   | API Versioning                        | 🟡 Medium     | Small      | 4-6h       | 📋 Planned                      | [↓](#api-versioning)                    |
| 7   | ~~Admin Dashboard Backend~~           | ~~🟡 Medium~~ | ~~Large~~  | ~~24-32h~~ | 🔀 Absorbed → Phase 3/4         | [↓](#admin-dashboard-backend)           |
| 10a | ~~Redis Rate Limit Store~~            | ~~🟡 Medium~~ | ~~Small~~  | ~~2-4h~~   | 🔀 Absorbed → Phase 2           | [↓](#redis-rate-limit-store)            |
| 10b | ~~Nginx Reverse Proxy Rate Limiting~~ | ~~🟡 Medium~~ | ~~Small~~  | ~~2-3h~~   | ✅ Done (superseded by Traefik) | [↓](#nginx-reverse-proxy-rate-limiting) |
| 8   | Two-Factor Authentication (2FA)       | 🟢 Low        | Large      | 20-24h     | 📋 Planned                      | [↓](#two-factor-authentication-2fa)     |
| 9   | Social Login (GitHub, Microsoft)      | 🟢 Low        | Medium     | 8-12h      | 📋 Planned                      | [↓](#social-login-github-microsoft)     |
| 10  | ~~Redis Caching Layer~~               | ~~🟢 Low~~    | ~~Medium~~ | ~~10-14h~~ | 🔀 Absorbed → Phase 2           | [↓](#redis-caching-layer)               |
| 11  | Webhook System                        | 🟢 Low        | Large      | 20-30h     | 📋 Planned                      | [↓](#webhook-system)                    |
| 12  | GraphQL API                           | 🟢 Low        | Large      | 30-40h     | 📋 Planned                      | [↓](#graphql-api)                       |

### Technical Debt & Improvements

| #   | Item                          | Priority      | Effort    | Details                             |
| --- | ----------------------------- | ------------- | --------- | ----------------------------------- |
| 13  | Code Organization Refactoring | 🟢 Low        | Small     | [↓](#code-organization-refactoring) |
| 14  | Performance Optimization      | 🟢 Low        | Medium    | [↓](#performance-optimization)      |
| 15  | ~~Security Enhancements~~     | ~~🟡 Medium~~ | ~~Small~~ | ✅ Done (helmet + Traefik + Zod) [↓](#security-enhancements) |
| 16  | Documentation Improvements    | 🟢 Low        | Small     | [↓](#documentation-improvements)    |

> **Note:** Items marked 🔀 Absorbed have been folded into the SaaS Platform phased plan. Their original acceptance criteria are preserved below for reference.
> When backlog exceeds 20 items, individual tasks will be moved to separate files in `backlog/` directory.

---

## 🏗️ SaaS Auth Platform — Phased Build Plan

> Transform this service into a multi-tenant SaaS auth provider (like Auth0/Clerk). Third-party customers register an Organisation, create Applications, and their end-users authenticate through those apps. Six phases, each independently releasable.
>
> **Automation principle:** Domain events + ports. Use cases emit events → in-process handlers perform side effects (email, provisioning, audit). Swap to a message queue later with no domain changes.
>
> **Decisions:** RS256 asymmetric JWT signing · JWKS public key endpoint · API key per tenant (client_id + client_secret) · Redis token denylist (feature-flagged) · Users global to Organisation · admin/user roles for MVP · PlanFeatureGuard scaffolded (all features free at MVP) · Email verification required for org creation · Auto-provision default app on org creation

---

### Phase 1 — RS256 Migration + JWKS

**Priority:** 🔴 High  
**Effort:** Medium  
**Dependencies:** None  
**Description:** Migrate JWT signing from HS256 (symmetric shared secret) to RS256 (asymmetric key pair). Add `jti` claim to every token (required for revocation in Phase 2). Expose a public JWKS endpoint so third-party servers can verify tokens locally without a network call.

**Acceptance Criteria:**

**P1-1 RSA key pair configuration**
- [ ] Add `RSA_PRIVATE_KEY` and `RSA_PUBLIC_KEY` env vars to `src/config/env.ts`
- [ ] Keys stored as PEM strings, base64-encoded for Docker env compatibility
- [ ] Add `docs/guides/key-generation.md` — how to generate the key pair with openssl

**P1-2 Update `TokenProvider` port**
- [ ] Add `getPublicKeyJwk(): object` method to `src/application/auth/ports/TokenProvider.ts`
- [ ] Extend `verify()` return type to include `jti`: `{ id, email, jti } | null`

**P1-3 Rewrite `JwtTokenProvider`**
- [ ] Sign tokens with RS256 private key (`src/infrastructure/auth/providers/JwtTokenProvider.ts`)
- [ ] Add `jti` (UUID v4) claim to every issued token
- [ ] `verify()` uses public key, returns `{ id, email, jti }` or null
- [ ] `getPublicKeyJwk()` returns public key in JWK format

**P1-4 JWKS endpoint**
- [ ] Create `WellKnownController` in `src/interfaces/http/controllers/`
- [ ] Route: `GET /.well-known/jwks.json` → `{ keys: [<JWK>] }` — no auth required
- [ ] Register in `routes.ts`
- [ ] Add Swagger docs

**P1-5 Tests**
- [ ] `JwtTokenProvider` unit tests for RS256 + jti
- [ ] Update all mocked `TokenProvider.verify()` calls to include `jti`
- [ ] Integration tests: confirm `jti` present in issued tokens

**Documentation:**
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark phase done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/architecture/authentication.md` — RS256 signing flow
- [ ] Update `docs/api/authentication.md` — JWKS endpoint reference

---

### Phase 2 — Redis Infrastructure + Token Denylist

**Priority:** 🔴 High  
**Effort:** Medium  
**Dependencies:** Phase 1 (tokens must have `jti` claim)  
**Absorbs:** Redis Caching Layer (#10), Redis Rate Limit Store (#10a)  
**Description:** Add Redis to the infrastructure for token denylist (access token revocation) and future caching. Revocation is feature-flagged off by default. When enabled, revoked JTIs are stored in Redis with TTL matching token expiry. Graceful degradation when Redis is unavailable.

**Acceptance Criteria:**

**P2-1 Add Redis to Docker Compose**
- [ ] Add `redis:7-alpine` service to `docker-compose.yml` (dev) and `docker-compose.prod.yml`
- [ ] Internal port only (not exposed to host in prod)
- [ ] Health check; app `depends_on` Redis

**P2-2 Redis config**
- [ ] Add `REDIS_URL` (default: `redis://localhost:6379`) to `src/config/env.ts`
- [ ] Add `TOKEN_REVOCATION_ENABLED` (default: `false` — opt-in)
- [ ] Add `REVOCATION_STRICT_MODE` (default: `false` — fail-open when Redis is down)

**P2-3 Redis connection module**
- [ ] Create `src/infrastructure/shared/redis/RedisClient.ts`
- [ ] Graceful degradation: log warning when Redis unavailable
- [ ] Behaviour depends on `REVOCATION_STRICT_MODE` (fail-open vs fail-closed)

**P2-4 `TokenDenylist` port**
- [ ] Create `src/application/auth/ports/TokenDenylist.ts`
- [ ] Interface: `add(jti: string, ttlSeconds: number): Promise<void>`, `isRevoked(jti: string): Promise<boolean>`

**P2-5 `RedisTokenDenylist` implementation**
- [ ] Create `src/infrastructure/auth/providers/RedisTokenDenylist.ts`
- [ ] Implements `TokenDenylist`
- [ ] Uses `SET jti 1 EX ttlSeconds` / `EXISTS jti`

**P2-6 Inject denylist into `JwtTokenProvider`**
- [ ] Optional `tokenDenylist?: TokenDenylist` constructor arg
- [ ] If `TOKEN_REVOCATION_ENABLED=true`, check denylist in `verify()`; return null if revoked

**P2-7 Wire into `server.ts` and `app.ts`**
- [ ] Add `tokenDenylist?: TokenDenylist` to `AppDependencies`
- [ ] Conditionally construct `RedisTokenDenylist` when revocation is enabled

**P2-8 Tests**
- [ ] Unit tests for `RedisTokenDenylist` (mock Redis client)
- [ ] Integration: revoked JTI causes `verify()` → null

**Documentation:**
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark phase done + absorbed items)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/architecture/overview.md` — document Redis in infrastructure layer
- [ ] Create/update `docs/guides/deployment.md` — Redis setup, Docker Compose config, graceful degradation

---

### Phase 3 — Organisation, Application & User Model

**Priority:** 🔴 High  
**Effort:** Large  
**Dependencies:** Phase 1 (RS256), Phase 2 (Redis)  
**Absorbs:** Email Verification (#3), Admin Dashboard Backend (#7)  
**Description:** Build the multi-tenant hierarchy: Organisation → Application → User. Add domain events, email service, audit logging, self-service signup with email verification, and auto-provisioning. This is the largest phase — seven sub-phases (3a–3g).

#### 3a — Organisation

**P3-1 `Organisation` domain entity**
- [ ] Create `src/domain/org/Organisation.ts`
- [ ] Fields: `id`, `name`, `plan` (`free`|`starter`|`pro`), `ownerId`, `createdAt`, `active`
- [ ] Methods: `isActive()`, `hasPlan(plan)`

**P3-2 Domain errors**
- [ ] Create `src/domain/org/errors.ts`
- [ ] `OrganisationNotFoundError`, `OrganisationAlreadyExistsError`

**P3-3 `OrganisationRepository` port**
- [ ] Create `src/application/org/ports/OrganisationRepository.ts`
- [ ] Methods: `save()`, `findById()`, `findByOwnerId()`, `deactivate()`

**P3-4 Use cases**
- [ ] `CreateOrganisation` — requires email-verified user; sets plan=free
- [ ] `GetOrganisation`
- [ ] `DeactivateOrganisation` (admin only)

**P3-5 `MongoOrganisationRepository`**
- [ ] Create `src/infrastructure/org/repositories/MongoOrganisationRepository.ts`

**P3-6 Organisation endpoints (admin-only, `OrgController`)**
- [ ] `POST /orgs` — create org (requires authenticated + email-verified user)
- [ ] `GET /orgs/:id` — get org details
- [ ] `GET /orgs/:id/users` — list org members
- [ ] `DELETE /orgs/:id/users/:userId` — remove member
- [ ] Swagger docs

#### 3b — Application (Tenant)

**P3-7 `Application` domain entity**
- [ ] Create `src/domain/tenant/Application.ts`
- [ ] Fields: `id`, `organisationId`, `name`, `clientId` (UUID), `clientSecretHash`, `createdAt`, `active`
- [ ] Config sub-object: `tokenTtlSeconds`, `revocationEnabled`, `allowedCallbackUrls`

**P3-8 Domain errors**
- [ ] Create `src/domain/tenant/errors.ts`
- [ ] `ApplicationNotFoundError`, `InvalidClientCredentialsError`, `ApplicationAlreadyExistsError`

**P3-9 Ports + use cases**
- [ ] `ApplicationRepository` port
- [ ] `RegisterApplication` — generates clientId (UUID) + clientSecret (random), hashes secret
- [ ] `AuthenticateApplication` — verifies clientId + clientSecret
- [ ] `ListApplications` — list all apps for an orgId (admin)
- [ ] `RotateApplicationSecret` — generates new secret, rehashes

**P3-10 `MongoApplicationRepository`**
- [ ] Create `src/infrastructure/tenant/repositories/MongoApplicationRepository.ts`

**P3-11 API key middleware**
- [ ] Create `src/interfaces/http/middleware/ApiKeyMiddleware.ts`
- [ ] Reads `Authorization: Basic base64(clientId:clientSecret)`
- [ ] Attaches `req.application` on success; returns 401 on failure

**P3-12 Application endpoints (admin-only, `TenantController`)**
- [ ] `POST /orgs/:id/apps` — create app → returns `clientId` + `clientSecret` (shown once)
- [ ] `GET /orgs/:id/apps` — list apps
- [ ] `POST /orgs/:id/apps/:clientId/rotate-secret`
- [ ] Swagger docs

#### 3c — User Extensions

**P3-13 Extend `User` entity**
- [ ] Add `organisationId: string` field
- [ ] Add `role: 'admin' | 'user'` field (default: `user`)
- [ ] Add `emailVerified: boolean` field

**P3-14 Update `MongoUserRepository`**
- [ ] Add `findByOrganisationId(orgId)` method
- [ ] Update Mongoose schema + migration note

**P3-15 Role middleware**
- [ ] Create `src/interfaces/http/middleware/RoleMiddleware.ts`
- [ ] `requireRole('admin')` — returns 403 if `user.role !== 'admin'`

#### 3d — Audit Log

**P3-16 `AuditEvent` domain entity**
- [ ] Create `src/domain/audit/AuditEvent.ts`
- [ ] Fields: `id`, `organisationId`, `applicationId`, `userId`, `eventType`, `ipAddress`, `userAgent`, `success`, `failureReason?`, `timestamp`
- [ ] Event types: `login` | `logout` | `token_refresh` | `token_revoked` | `failed_login` | `org_created` | `app_created`

**P3-17 `AuditRepository` port + `MongoAuditRepository`**
- [ ] Append-only: `log(event): Promise<void>`
- [ ] `findByOrg(orgId, filters, pagination): Promise<AuditEvent[]>`
- [ ] TTL index: 90 days default (configurable via `AUDIT_TTL_DAYS` env var)

**P3-18 `AuditService` use case helper**
- [ ] Thin wrapper: `logEvent(partial event)` — fills missing fields, saves
- [ ] Injected into use cases that need to emit audit events

**P3-19 Instrument existing use cases**
- [ ] `LoginUser` → emit `login` or `failed_login`
- [ ] `LogoutCurrentSession` → emit `logout`
- [ ] `RefreshSession` → emit `token_refresh`
- [ ] `RevokeAccessToken` → emit `token_revoked`

**P3-20 Audit log endpoint (admin only)**
- [ ] `GET /orgs/:id/audit` — paginated, filterable by `userId`, `appId`, `eventType`, `from`, `to`
- [ ] Swagger docs

#### 3e — Domain Events & Event Bus

**P3-21 `DomainEvent` base type + event definitions**
- [ ] Create `src/domain/shared/events/` — typed value objects, no npm deps
- [ ] Events: `UserRegistered`, `EmailVerified`, `OrgCreated`, `AppCreated`, `AppSecretRotated`, `TokenRevoked`, `FailedLogin`, `UserBlocked`

**P3-22 `EventPublisher` port**
- [ ] Create `src/application/shared/ports/EventPublisher.ts`
- [ ] `publish(event: DomainEvent): Promise<void>`
- [ ] Use cases receive via constructor injection (optional — gracefully skipped if not provided)

**P3-23 `InProcessEventBus` implementation**
- [ ] Create `src/infrastructure/shared/events/InProcessEventBus.ts`
- [ ] Uses Node.js `EventEmitter`; handlers registered at startup in `server.ts`
- [ ] Async handlers — errors caught + logged, never crash main flow

**P3-24 Instrument use cases to emit events**
- [ ] `RegisterUser` → `UserRegistered`
- [ ] `LoginUser` → `FailedLogin` on `InvalidCredentialsError`
- [ ] `CreateOrganisation` → `OrgCreated`
- [ ] `RegisterApplication` → `AppCreated`
- [ ] `RotateApplicationSecret` → `AppSecretRotated`
- [ ] `RevokeAccessToken` → `TokenRevoked`

**P3-25 Provision handler: `OrgCreated` → auto-create default App**
- [ ] On `OrgCreated` event: call `RegisterApplication` with name `"Default"` under new org
- [ ] Resulting `AppCreated` event triggers credential email

**P3-26 Audit handler: domain events → `AuditRepository`**
- [ ] `FailedLogin`, `TokenRevoked`, login/logout events → write `AuditEvent`
- [ ] Replaces manual audit wiring inside use cases

#### 3f — Email Service

> Absorbs existing backlog item: Email Verification (#3)

**P3-27 `EmailService` port**
- [ ] Create `src/application/shared/ports/EmailService.ts`
- [ ] `sendVerificationEmail(to, verificationUrl): Promise<void>`
- [ ] `sendWelcomeEmail(to, orgName): Promise<void>`
- [ ] `sendCredentialsEmail(to, appName, clientId, clientSecret): Promise<void>`
- [ ] `sendPasswordResetEmail(to, resetUrl): Promise<void>`

**P3-28 `NodemailerEmailService`**
- [ ] Create `src/infrastructure/shared/email/NodemailerEmailService.ts`
- [ ] SMTP config via env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- [ ] HTML templates (inline for MVP)
- [ ] Graceful degradation: log warning + skip if SMTP not configured (dev/test)

**P3-29 Email verification flow**
- [ ] Add `emailVerified`, `emailVerificationToken`, `emailVerificationExpires` to `User`
- [ ] `POST /auth/verify-email` — consumes token, sets `emailVerified=true`, emits `EmailVerified`
- [ ] `POST /auth/resend-verification` — generates new token, emits `UserRegistered`
- [ ] `UserRegistered` event handler → calls `EmailService.sendVerificationEmail()`

**P3-30 Credentials delivery automation**
- [ ] `AppCreated` handler → `EmailService.sendCredentialsEmail()` to org admin
- [ ] `AppSecretRotated` handler → `EmailService.sendCredentialsEmail()` with new secret

**P3-31 Email in Docker Compose**
- [ ] Add `SMTP_*` env vars to `.env.development` template
- [ ] Add optional `mailhog` service to `docker-compose.yml` for local email testing

#### 3g — Self-Service Signup Flow

**P3-32 Email verification gate**
- [ ] `CreateOrganisation` checks `user.emailVerified === true`
- [ ] Clear error: `"Email must be verified before creating an organisation"`

**P3-33 Subscription-ready feature guard**
- [ ] Create `PlanFeatureGuard` in `src/interfaces/http/middleware/PlanFeatureGuard.ts`
- [ ] `requirePlan('starter')` → 403 + `{ code: 'upgrade_required', requiredPlan: 'starter' }`
- [ ] All features pass through on `free` plan at MVP — scaffold for future gating

**Phase 3 Documentation:**
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark phase done + absorbed items)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/architecture/overview.md` — org/tenant model, event bus, email
- [ ] Update `docs/architecture/database-schema.md` — Organisation, Application, AuditEvent, User extensions
- [ ] Update `docs/api/endpoints.md` — all new endpoints
- [ ] Create `docs/guides/saas-integration.md` — third-party integration guide

---

### Phase 4 — Config Portal API

**Priority:** 🟡 Medium  
**Effort:** Medium  
**Dependencies:** Phase 3 (Organisation + Application model)  
**Description:** Per-application configuration API allowing org admins to customise token TTL, revocation behaviour, and callback URLs. Plan-gated feature checks are scaffolded but all features are accessible on the `free` plan at MVP.

**Acceptance Criteria:**

**P4-1 Application config schema**
- [ ] `tokenTtlSeconds` (default: 300 / 5 min)
- [ ] `revocationEnabled` (default: false)
- [ ] `allowedCallbackUrls` (array of strings)
- [ ] `maxSessionsPerUser` (default: unlimited / null)

**P4-2 Config use cases**
- [ ] `GetApplicationConfig`
- [ ] `UpdateApplicationConfig` — validates values, respects org plan limits

**P4-3 Config endpoints (admin only, `ConfigController`)**
- [ ] `GET /orgs/:id/apps/:clientId/config`
- [ ] `PATCH /orgs/:id/apps/:clientId/config`
- [ ] Swagger docs

**P4-4 Plan-gated feature check**
- [ ] `checkFeatureAccess(org, featureName)` utility
- [ ] Returns 403 + `upgrade_required` if plan doesn't allow
- [ ] MVP: all features accessible on `free` plan

**Documentation:**
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark phase done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/endpoints.md` — config endpoints

---

### Phase 5 — Introspection & Revocation Endpoints

**Priority:** 🟡 Medium  
**Effort:** Medium  
**Dependencies:** Phase 1 (RS256), Phase 2 (Redis denylist), Phase 3b (API key middleware)  
**Description:** Token introspection endpoint (RFC 7662) for third-party servers to verify tokens with revocation awareness. Access token revocation endpoint for emergency blocking. Both protected by API key middleware.

**Acceptance Criteria:**

**P5-1 `IntrospectToken` use case**
- [ ] Create `src/application/auth/use-cases/IntrospectToken.ts`
- [ ] Verify RS256 signature; check Redis denylist if revocation enabled for the application
- [ ] Return RFC 7662: `{ active, sub, email, exp, jti, client_id }`

**P5-2 `RevokeAccessToken` use case**
- [ ] Create `src/application/auth/use-cases/RevokeAccessToken.ts`
- [ ] Decode token → extract `jti` + `exp`
- [ ] Add JTI to Redis denylist (TTL = remaining token lifetime)
- [ ] Requires `TOKEN_REVOCATION_ENABLED=true`

**P5-3 Introspection endpoint**
- [ ] `POST /auth/introspect` — protected by `ApiKeyMiddleware`
- [ ] Rate limited (dedicated stricter limiter)
- [ ] Logs audit event
- [ ] Swagger docs

**P5-4 Access token revocation endpoint**
- [ ] `POST /auth/revoke` — admin + `ApiKeyMiddleware`
- [ ] Body: `{ token }` or `{ jti }`
- [ ] Returns `204 No Content`
- [ ] Logs audit event
- [ ] Swagger docs

**P5-5 Tests**
- [ ] Unit: `IntrospectToken`, `RevokeAccessToken`
- [ ] Integration: introspect valid, introspect revoked, revoke then introspect

**Documentation:**
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark phase done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/endpoints.md` — introspect + revoke endpoints
- [ ] Update `docs/api/authentication.md` — introspection flow

---

### Phase 6 — Documentation & Planning Updates

**Priority:** 🟡 Medium  
**Effort:** Small  
**Dependencies:** All prior phases  
**Description:** Final documentation pass — update architecture docs, create integration guide, update API reference, update planning docs and changelog.

**Acceptance Criteria:**

**P6-1 Architecture docs**
- [ ] `docs/architecture/overview.md` — Redis, RS256, JWKS, org/tenant model, audit, event bus
- [ ] `docs/architecture/authentication.md` — updated JWT flow, RS256 key management

**P6-2 Integration guide**
- [ ] Create `docs/guides/saas-integration.md` — how a third-party server integrates (JWKS, introspection, revocation)

**P6-3 API docs**
- [ ] `docs/api/endpoints.md` — all new endpoints consolidated
- [ ] `docs/api/authentication.md` — RS256 migration notes for existing consumers

**P6-4 Planning + changelog**
- [ ] `docs/planning/index.md` — final completed feature entries
- [ ] `docs/planning/backlog.md` — mark all SaaS phases complete
- [ ] `docs/changelog/2026-03.md` (or later month) — changelog entries

---

## 🔴 High Priority (Standalone)

### Rate Limiting Middleware

**Priority:** 🔴 High — ✅ **Completed 2026-03-01**
**Effort:** Small

**Description:**
Implemented `express-rate-limit` middleware protecting auth endpoints (5 req/15 min) and protected API endpoints (100 req/15 min). Returns `429 Too Many Requests` with `RateLimit-*` standard headers. Rate limiting is opt-out via `rateLimiting: false` in `AppDependencies` (used in tests).

**Acceptance Criteria:**

- [x] Install and configure express-rate-limit
- [x] Apply rate limiting to auth routes
- [x] Apply rate limiting to protected routes
- [x] Return proper 429 status codes
- [x] Add rate limit info to response headers (`RateLimit-*`)
- [x] Document rate limits in API docs (Swagger 429 responses + `RateLimitError` schema)
- [x] Add tests for rate limiting

**Related:**

- Security improvements
- API documentation updates

---

### Refresh Token Implementation

**Priority:** 🔴 High — ✅ **Completed 2026-02-21**  
**Effort:** Medium

**Description:**  
Implemented as "JWT Lifecycle Hardening" — rotating refresh tokens with reuse detection, token-family revocation, per-device and all-device logout, and admin-forced revocation. See [index.md](index.md#jwt-lifecycle-hardening---2026-02-21) for full details.

**Acceptance Criteria:**

- [x] Create RefreshToken model (`RefreshSession` entity + `MongoRefreshSessionRepository`)
- [x] Modify login to return both tokens
- [x] Create POST /auth/refresh endpoint
- [x] Implement token rotation with reuse detection
- [x] Add logout endpoint to invalidate tokens (`/auth/logout`, `/auth/logout-all`, `/auth/admin/revoke`)
- [x] Update documentation
- [x] Add integration tests (45 new tests)

---

### Frontend Auth Integration

**Priority:** 🔴 High  
**Effort:** Medium  
**Dependencies:** Refresh Token Implementation (✅ Done)

**Description:**  
The backend now issues short-lived access tokens (5m) with rotating refresh tokens in httpOnly cookies. The frontend must be updated to work with this new token lifecycle — without these changes, users would be forced to re-login every 5 minutes.

**Background — what changed:**

| Before                           | After                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------- |
| Login returns a 24h access token | Login returns a 5m access token + httpOnly refresh cookie                     |
| Token stored in localStorage     | Access token held in memory only; refresh token managed by browser cookie jar |
| No refresh mechanism needed      | Must call `POST /auth/refresh` before access token expires                    |
| Logout = clear local token       | Logout = call `POST /auth/logout` to revoke server-side session               |

**What stays the same:**

- Login form → `POST /auth/login` (same request body)
- Register form → `POST /auth/register` (same request body)
- Google SSO → `GET /auth/google` redirect (same flow)
- Protected calls → `Authorization: Bearer <token>` header (same)

**Acceptance Criteria:**

#### 1. Credentials Mode

- [ ] All API calls to `/auth/*` include `credentials: 'include'` (fetch) or `withCredentials: true` (axios) so httpOnly cookies are sent

#### 2. In-Memory Token Storage

- [ ] Access token stored in a JS variable / reactive state (not localStorage or sessionStorage)
- [ ] On page reload, call `POST /auth/refresh` to restore the session from the cookie
- [ ] Clear in-memory token on logout

#### 3. Auth Interceptor (Auto-Refresh)

- [ ] Create an HTTP interceptor (axios interceptor or fetch wrapper) that:
  - Detects 401 responses on protected API calls
  - Calls `POST /auth/refresh` to obtain a new access token
  - Retries the original failed request with the new token
  - If refresh also fails (401), redirect to login
- [ ] Proactive refresh: optionally refresh the token before the 5m window expires (e.g., at 4m mark) to avoid latency on the first 401

#### 4. Refresh Queue (Race Condition Handling)

- [ ] If multiple API calls receive 401 simultaneously, only one triggers the refresh
- [ ] Other calls wait for the refresh to complete, then retry with the new token
- [ ] Prevent infinite refresh loops (e.g., max 1 retry per request)

#### 5. Logout Integration

- [ ] "Logout" button calls `POST /auth/logout` (with `credentials: 'include'` to send cookie)
- [ ] Clear in-memory access token and redirect to login
- [ ] Optionally add "Logout all devices" button that calls `POST /auth/logout-all` with `Authorization: Bearer <token>`

#### 6. Login / Register Response Handling

- [ ] On successful login/register, extract `token` from response body and store in memory
- [ ] Do NOT try to read the refresh token — it's set as an httpOnly cookie automatically
- [ ] Redirect to the authenticated area of the app

#### 7. Google SSO Callback

- [ ] After Google OAuth redirect, extract access token from response
- [ ] Refresh cookie is set automatically by the API — no additional handling needed

#### 8. Error Handling

- [ ] Handle `TokenReuseDetectedError` (401 with "reuse detected" message) — clear state and force full re-login
- [ ] Handle `SessionExpiredError` — redirect to login with appropriate message
- [ ] Handle network errors during refresh gracefully

**Implementation Notes:**

```typescript
// Example: Axios interceptor pattern
let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      accessToken = await refreshPromise;
      error.config.headers.Authorization = `Bearer ${accessToken}`;
      return api(error.config);
    }
    return Promise.reject(error);
  },
);
```

**Acceptance Testing:**

- [ ] Login → receive token → access protected route → wait 5m → auto-refresh works
- [ ] Open two tabs → both share the same cookie → refresh works in both
- [ ] Logout → cookie cleared → refresh fails → redirected to login
- [ ] Logout all devices → other tabs fail on next refresh → redirected to login
- [ ] Simulate token theft (replay old refresh token) → reuse detected → forced re-login

**Documentation:**

- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Create/update `docs/guides/setup.md` — frontend integration guide (token storage, interceptor pattern, cookie requirements)

---

### Email Verification

**Priority:** 🔴 High — 🔀 **Absorbed into SaaS Platform Phase 3f (P3-29)**  
**Effort:** Large  
**Estimated Time:** 16-20 hours

> **Note:** This item has been folded into the SaaS Platform plan. Email verification is now part of Phase 3f (Email Service), which also adds the `EmailService` port, Nodemailer implementation, `UserRegistered` domain event handler, and automated credential delivery. Original acceptance criteria preserved below for reference.

**Description:**  
Add email verification to ensure valid email addresses and prevent fake accounts.

**Requirements:**

- Generate verification token on registration
- Send verification email (requires email service)
- Verification endpoint to confirm email
- Mark users as verified/unverified
- Resend verification email option
- Block unverified users from certain actions

**Acceptance Criteria:**

- [ ] Add email service integration (SendGrid/AWS SES)
- [ ] Add emailVerified field to User model
- [ ] Generate secure verification tokens
- [ ] Create POST /auth/verify-email endpoint
- [ ] Create POST /auth/resend-verification endpoint
- [ ] Send styled HTML emails
- [ ] Block unverified users from protected routes
- [ ] Add email templates
- [ ] Add tests
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/endpoints.md` — document `/auth/verify-email` and `/auth/resend-verification`
- [ ] Update `docs/api/authentication.md` — document the email verification flow
- [ ] Update `docs/architecture/database-schema.md` — add `emailVerified`, `emailVerificationToken`, `emailVerificationExpires` fields

**Database Changes:**

```typescript
interface IUser {
  // existing fields...
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
}
```

---

## 🟡 Medium Priority

### Automated Testing Suite

**Priority:** 🟡 Medium — ✅ **Completed 2026-02-28**
**Effort:** Large

**Description:**
Implemented with Vitest as the test runner and Supertest for HTTP integration tests. All use cases, providers, controllers, and routes are covered. No real database is required — mocks are injected via `createApp(deps)`.

**Acceptance Criteria:**

- [x] Set up test framework (Vitest)
- [x] Configure test isolation (mock injection, no DB required)
- [x] Write unit tests for use cases
- [x] Write unit tests for providers (BcryptPasswordHasher, JwtTokenProvider, JwtRefreshTokenProvider)
- [x] Write integration tests for auth routes
- [x] Write integration tests for session routes
- [x] Write integration tests for protected routes
- [x] 89 tests passing, zero failures
- [ ] Coverage reporting (available via `npm run test:coverage`)
- [ ] CI/CD integration (planned)

---

### Password Reset Flow

**Priority:** 🟡 Medium  
**Effort:** Medium  
**Estimated Time:** 10-14 hours

**Description:**  
Allow users to reset their password via email when they forget it.

**Requirements:**

- Request password reset endpoint
- Generate secure reset token
- Send reset email with link
- Reset password endpoint
- Token expiration (1 hour)
- Invalidate token after use

**Acceptance Criteria:**

- [ ] Create POST /auth/forgot-password endpoint
- [ ] Create POST /auth/reset-password endpoint
- [ ] Add resetToken fields to User model
- [ ] Generate secure tokens
- [ ] Send reset email
- [ ] Validate reset tokens
- [ ] Expire tokens after 1 hour
- [ ] Hash new password
- [ ] Add tests
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/endpoints.md` — document `/auth/forgot-password` and `/auth/reset-password`
- [ ] Update `docs/api/authentication.md` — document the password reset flow

---

### API Versioning

**Priority:** 🟡 Medium  
**Effort:** Small  
**Estimated Time:** 4-6 hours

**Description:**  
Implement API versioning to support multiple API versions simultaneously.

**Requirements:**

- Version prefix in routes (e.g., `/v1/auth/login`)
- Current routes become v1
- Support for multiple versions
- Version header option
- Deprecation warnings for old versions

**Acceptance Criteria:**

- [ ] Add /v1 prefix to all routes
- [ ] Update Swagger configuration
- [ ] Add version middleware
- [ ] Support Accept-Version header
- [ ] Update documentation
- [ ] Add deprecation mechanism
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/endpoints.md` — prefix all routes with `/v1`
- [ ] Update `docs/api/authentication.md` — note versioning strategy
- [ ] Update `docs/guides/development.md` — document how to add new API versions
- [ ] Update frontend integration docs to use `/v1` prefix

---

### Admin Dashboard Backend

**Priority:** 🟡 Medium — 🔀 **Absorbed into SaaS Platform Phase 3a/3c/4**  
**Effort:** Large  
**Estimated Time:** 24-32 hours

> **Note:** This item has been folded into the SaaS Platform plan. Admin roles (Phase 3c — P3-13, P3-15), org/user management endpoints (Phase 3a — P3-6), audit log viewing (Phase 3d — P3-20), and app config portal (Phase 4) collectively replace this item. Original acceptance criteria preserved below for reference.

**Description:**  
Create admin-only endpoints for user management and system monitoring.

**Requirements:**

- Admin role system
- User management endpoints (list, view, delete, suspend)
- System statistics endpoint
- Audit log viewing
- Admin authentication

**Acceptance Criteria:**

- [ ] Add roles field to User model
- [ ] Create role-based middleware
- [ ] Create admin routes
- [ ] GET /admin/users (list all users)
- [ ] GET /admin/users/:id (view user)
- [ ] PUT /admin/users/:id (update user)
- [ ] DELETE /admin/users/:id (delete user)
- [ ] GET /admin/stats (system statistics)
- [ ] Add admin seed script
- [ ] Add tests
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/endpoints.md` — document all `/admin/*` endpoints
- [ ] Update `docs/architecture/overview.md` — document role-based access control
- [ ] Update `docs/architecture/database-schema.md` — add `roles` field to User schema
- [ ] Create `docs/guides/setup.md` section — document admin seed script usage

---

## 🟢 Low Priority

### Two-Factor Authentication (2FA)

**Priority:** 🟢 Low  
**Effort:** Large  
**Estimated Time:** 20-24 hours

**Description:**  
Add optional two-factor authentication using TOTP (Google Authenticator, Authy).

**Requirements:**

- Enable/disable 2FA per user
- Generate QR code for setup
- Verify TOTP codes
- Backup codes
- 2FA required on login

**Acceptance Criteria:**

- [ ] Add 2FA fields to User model
- [ ] Install speakeasy/otplib
- [ ] Create POST /auth/2fa/enable endpoint
- [ ] Create POST /auth/2fa/verify endpoint
- [ ] Generate and display QR codes
- [ ] Generate backup codes
- [ ] Modify login flow for 2FA
- [ ] Add tests
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/endpoints.md` — document `/auth/2fa/enable` and `/auth/2fa/verify`
- [ ] Update `docs/api/authentication.md` — document the 2FA login flow
- [ ] Update `docs/architecture/database-schema.md` — add 2FA fields to User schema

---

### Social Login (GitHub, Microsoft)

**Priority:** 🟢 Low  
**Effort:** Medium  
**Estimated Time:** 8-12 hours

**Description:**  
Add additional OAuth providers beyond Google.

**Requirements:**

- GitHub OAuth integration
- Microsoft/Azure AD OAuth
- Link multiple social accounts
- Unified OAuth callback handler

**Acceptance Criteria:**

- [ ] Add GitHub Passport strategy
- [ ] Add Microsoft Passport strategy
- [ ] Create OAuth routes for each provider
- [ ] Update User model for multiple providers
- [ ] Allow linking accounts
- [ ] Add tests
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/authentication.md` — document GitHub and Microsoft OAuth flows
- [ ] Update `docs/architecture/database-schema.md` — document multi-provider User schema changes
- [ ] Update `docs/guides/setup.md` — add GitHub and Microsoft OAuth app configuration steps

---

### Redis Caching Layer

**Priority:** 🟢 Low — 🔀 **Absorbed into SaaS Platform Phase 2 (P2-1 to P2-3)**  
**Effort:** Medium  
**Estimated Time:** 10-14 hours

> **Note:** This item has been folded into the SaaS Platform plan. Redis infrastructure (Docker Compose, connection module, graceful degradation) is now Phase 2. Token denylist uses Redis for revocation checks. Rate limit store upgrade (Redis Rate Limit Store) is also covered. Original acceptance criteria preserved below for reference.

**Description:**  
Add Redis for caching and session storage to improve performance.

**Requirements:**

- Redis connection setup
- Cache frequently accessed data
- Session storage in Redis
- Cache invalidation strategy
- Optional (graceful degradation if Redis down)

**Acceptance Criteria:**

- [ ] Add Redis to Docker Compose
- [ ] Install redis client
- [ ] Create Redis connection module
- [ ] Cache user lookups
- [ ] Store sessions in Redis
- [ ] Implement cache invalidation
- [ ] Add cache middleware
- [ ] Add tests
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/architecture/overview.md` — document Redis in the infrastructure layer
- [ ] Create/update `docs/guides/deployment.md` — Redis setup, Docker Compose config, and graceful degradation notes

---

### Redis Rate Limit Store

**Priority:** 🟡 Medium — 🔀 **Absorbed into SaaS Platform Phase 2 (P2-1 to P2-3)**  
**Effort:** Small  
**Estimated Time:** 2-4 hours  
**Dependencies:** Redis Caching Layer (✅ now part of Phase 2)

> **Note:** This item has been folded into the SaaS Platform plan. Redis infrastructure (Phase 2) provides the shared Redis instance. Rate limiter migration to `rate-limit-redis` will use the shared Redis client from Phase 2. Original acceptance criteria preserved below for reference.

**Description:**  
The current `express-rate-limit` middleware uses an **in-memory store**, which means each Node.js process maintains its own independent counter. If the app is ever scaled horizontally (multiple instances or pods), a client gets `limit × instances` effective requests — completely defeating the rate limiter. Switching to `rate-limit-redis` gives a single shared counter across all instances.

**Requirements:**

- Install `rate-limit-redis` (or `@upstash/ratelimit` for serverless)
- Connect rate limiter to the existing Redis instance
- Graceful degradation: fall back to in-memory if Redis is unavailable
- No change to the existing limits or API behaviour

**Acceptance Criteria:**

- [ ] Install `rate-limit-redis`
- [ ] Create a shared Redis client (reuse from Redis Caching Layer)
- [ ] Pass Redis store to `authRateLimiter` and `protectedRateLimiter`
- [ ] Verify counters are shared across two parallel app instances
- [ ] Graceful degradation when Redis is down (log warning, don't crash)
- [ ] Update tests (mock Redis store)
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/architecture/overview.md` to note Redis as rate limit store

**Notes:**
Must be implemented before deploying more than one Node instance in production. Safe to skip until horizontal scaling is needed.

---

### Nginx Reverse Proxy Rate Limiting

**Priority:** 🟡 Medium  
**Effort:** Small  
**Estimated Time:** 2-3 hours  
**Dependencies:** Redis Rate Limit Store (app-level limiter should be hardened first)

**Description:**  
Move coarse-grained rate limiting to the Nginx reverse proxy layer so that excess traffic is rejected **before** it reaches Node.js. This reduces CPU/memory load on the app for abusive clients. The `express-rate-limit` middleware is kept as a defence-in-depth backstop (e.g. if someone hits the app directly by IP).

**Requirements:**

- Nginx `limit_req_zone` and `limit_req` directives for `/auth/` and `/api/` locations
- Return `429` with a JSON body consistent with the app's error format
- App-level rate limiter remains active but limits are relaxed (higher threshold) since Nginx handles the primary enforcement
- Nginx config added to Docker Compose production setup

**Acceptance Criteria:**

- [ ] Add `limit_req_zone` zones in `nginx.conf` (auth: 5r/m, api: 100r/m per IP)
- [ ] Apply `limit_req` to `/auth/` and `/api/` location blocks
- [ ] Configure `limit_req_status 429` and a custom JSON error page
- [ ] Relax app-level limits to act as backstop only (e.g. 2× Nginx limit)
- [ ] Test that Nginx blocks before Node handles the request (check access logs)
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Create/update `docs/guides/deployment.md` — document Nginx rate limiting config and how to tune limits
- [ ] Update `docs/architecture/overview.md` — note Nginx as the primary rate limiting layer
- [ ] Update `docker-compose.prod.yml` with Nginx service config

---

### Webhook System

**Priority:** 🟢 Low  
**Effort:** Large  
**Estimated Time:** 20-30 hours

**Description:**  
Allow external systems to subscribe to events (user registered, login, etc.).

**Requirements:**

- Webhook registration endpoints
- Event types (user.created, user.login, etc.)
- Secure webhook signing
- Retry logic for failed webhooks
- Webhook logs and monitoring

**Acceptance Criteria:**

- [ ] Create Webhook model
- [ ] Create webhook CRUD endpoints
- [ ] Implement event emitter
- [ ] Add webhook signing
- [ ] Implement retry queue
- [ ] Add webhook logs
- [ ] Create webhook testing tool
- [ ] Add tests
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Update `docs/api/endpoints.md` — document all `/webhooks/*` endpoints
- [ ] Update `docs/architecture/overview.md` — document event emitter pattern

---

### GraphQL API

**Priority:** 🟢 Low  
**Effort:** Large  
**Estimated Time:** 30-40 hours

**Description:**  
Add GraphQL API alongside REST API for more flexible data fetching.

**Requirements:**

- GraphQL server setup
- Schema definitions
- Resolvers for all operations
- GraphQL Playground
- Authentication with GraphQL
- Subscriptions (optional)

**Acceptance Criteria:**

- [ ] Install Apollo Server
- [ ] Define GraphQL schema
- [ ] Create resolvers
- [ ] Add authentication middleware
- [ ] Set up GraphQL Playground
- [ ] Implement subscriptions (optional)
- [ ] Add tests
- [ ] Update `docs/planning/index.md` with completed feature entry
- [ ] Update `docs/planning/backlog.md` (mark done)
- [ ] Add entry to `docs/changelog/YYYY-MM.md`
- [ ] Create `docs/api/graphql.md` — schema reference and example queries
- [ ] Update `docs/architecture/overview.md` — document GraphQL alongside REST

---

## 📋 Technical Debt & Improvements

### Code Organization Refactoring

**Priority:** 🟢 Low  
**Effort:** Small

- [ ] Extract route handlers to controllers
- [ ] Create service layer for business logic
- [ ] Standardize error responses
- [ ] Create response helper utilities
- [ ] Improve TypeScript type reuse

### Performance Optimization

**Priority:** 🟢 Low  
**Effort:** Medium

- [ ] Add database indexes
- [ ] Implement query optimization
- [ ] Add compression middleware
- [ ] Optimize Docker image size
- [ ] Implement lazy loading where applicable

### Security Enhancements

**Priority:** 🟡 Medium  
**Effort:** Small  
**Status:** ✅ Partially completed 2026-03-02

- [x] Add helmet.js for security headers
- [ ] Implement CSRF protection
- [x] Add input sanitization (Zod schema validation at HTTP boundary)
- [ ] Set up security.txt
- [x] Implement security headers (helmet + Traefik middleware)

### Documentation Improvements

**Priority:** 🟢 Low  
**Effort:** Small

- [ ] Add API examples for all endpoints
- [ ] Create video tutorials
- [ ] Add deployment guides for cloud providers
- [ ] Create troubleshooting guide
- [ ] Add architecture diagrams

---

## 🎯 Future Ideas (Not Prioritized)

- ~~Multi-tenancy support~~ (now SaaS Platform phased plan)
- ~~Microservices architecture~~ (event bus in Phase 3e provides the migration path)
- Event sourcing and CQRS
- Real-time notifications (WebSockets)
- File upload and storage
- Search functionality (Elasticsearch)
- Internationalization (i18n)
- Mobile app backend features
- Payment integration (for subscription tiers)
- Analytics and reporting
- SDK packages (Node.js, Python, Go) for third-party integration
- CLI tool for org/app management

---

**Last Updated:** 2026-03-03  
**Total Items:** 6 SaaS phases + 6 standalone + 4 technical debt + ideas  
**Next Review:** 2026-03-31
