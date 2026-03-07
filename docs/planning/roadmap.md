# Project Roadmap

Long-term vision and milestones for the Express Auth API.

---

## Vision

Build a **production-ready, multi-tenant SaaS authentication platform** (comparable to Auth0/Clerk) that third-party applications can integrate with to authenticate their users. The service issues JWTs verifiable via a public JWKS endpoint, supports per-tenant configuration, and provides token introspection and revocation capabilities.

---

## Phases Overview

| Phase                                                              | Status      | Target     | Key Goals                                                  | Progress        |
| ------------------------------------------------------------------ | ----------- | ---------- | ---------------------------------------------------------- | --------------- |
| [1: Foundation](#-phase-1-foundation-completed---feb-2026)         | ✅ Complete | Feb 2026   | Core auth, TypeScript, Docker                              | 100% (7/7)      |
| [2: Security & Robustness](#-phase-2-security--robustness-q1-2026) | 🚧 Current  | Mar 2026   | Rate limiting, refresh tokens, testing, security hardening | 67% (4/6)       |
| [SaaS Platform](#-saas-platform-phased-build-plan)                 | 📋 Planned  | Q1-Q2 2026 | RS256, Redis, multi-tenant, introspection, config portal   | 0% (0/6 phases) |
| [3: Advanced Features](#-phase-3-advanced-features-q2-2026)        | 📋 Planned  | Q2 2026    | 2FA, API versioning (items not absorbed by SaaS plan)      | 0%              |
| [4: Scale & Extend](#-phase-4-scale--extend-q2-q3-2026)            | 📋 Planned  | Q2-Q3 2026 | Additional OAuth, webhooks, GraphQL                        | 0%              |
| [5: Ecosystem](#-phase-5-ecosystem-q3-q4-2026)                     | 💡 Future   | Q3-Q4 2026 | SDKs, CLI, admin UI                                        | 0%              |

**Legend:** ✅ Complete | 🚧 In Progress | 📋 Planned | 💡 Future

> **Note:** Many items originally in Phases 3 and 4 (Redis, admin dashboard, RBAC) have been absorbed into the SaaS Platform plan. See [backlog.md](backlog.md#-saas-auth-platform--phased-build-plan) for the full phased build plan.

---

## Milestones

### ✅ Phase 1: Foundation (Completed - Feb 2026)

**Status:** Complete  
**Duration:** 2 weeks

**Goals:**

- ✅ Core authentication system (email/password, OAuth)
- ✅ JWT token-based auth
- ✅ TypeScript migration with strict typing
- ✅ Docker containerization
- ✅ Multi-environment support
- ✅ Basic API documentation

**Achievements:**

- Fully functional authentication system
- Type-safe codebase
- Containerized deployment
- Comprehensive documentation started

---

### 🚧 Phase 2: Security & Robustness (Q1 2026)

**Status:** 🚧 Current Phase  
**Target:** March 2026  
**Progress:** 4/6 goals complete

**Goals:**

- [x] Rate limiting — ✅ Completed 2026-03-01 (`express-rate-limit`, 5/15min auth, 100/15min API)
- [x] Refresh tokens — ✅ Completed 2026-02-21 (rotating refresh tokens, reuse detection, family revocation)
- [ ] Email verification — 🔀 Absorbed into SaaS Platform Phase 3f
- [ ] Password reset flow — 📋 Planned (standalone backlog item)
- [x] Automated testing suite (>80% coverage) — ✅ Completed 2026-03-02 (≥90% coverage, Vitest)
- [x] Security audit — ✅ Completed 2026-03-02 (helmet, Traefik, Zod validation, Docker hardening, CI/CD security)

**Achievements:**

- Rotating refresh tokens with reuse detection and family-based revocation
- Rate limiting on all endpoints with proper 429 responses
- ≥90% test coverage across all Clean Architecture layers
- Security headers (helmet + Traefik), input validation (Zod), Docker non-root user
- CI/CD with CodeQL SAST, Trivy scanning, Dependabot, branch protection

**Remaining:**

- Password reset flow (standalone, depends on email service)
- Email verification (now part of SaaS Platform plan)

---

### 🏗️ SaaS Platform Phased Build Plan

**Status:** 📋 Planned  
**Target:** Q1-Q2 2026  
**Full plan:** [backlog.md — SaaS Platform section](backlog.md#-saas-auth-platform--phased-build-plan)

This is the major initiative to transform the service into a multi-tenant SaaS auth provider. Six independently releasable phases:

| Phase | Scope                      | Key Deliverables                                                                                          |
| ----- | -------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1     | RS256 Migration + JWKS     | Asymmetric JWT signing, `/.well-known/jwks.json`, `jti` claim                                             |
| 2     | Redis + Token Denylist     | Redis infra, access token revocation (feature-flagged), graceful degradation                              |
| 3     | Org, App & User Model      | Organisation → Application → User hierarchy, domain events, email service, audit log, self-service signup |
| 4     | Config Portal API          | Per-app configuration, plan-gated feature checks                                                          |
| 5     | Introspection & Revocation | RFC 7662 token introspection, `POST /auth/revoke`, API key auth                                           |
| 6     | Docs & Planning            | Architecture docs, integration guide, API reference, changelog                                            |

**Absorbs previous backlog items:** Email Verification, Admin Dashboard Backend, Redis Caching Layer, Redis Rate Limit Store

---

### 📅 Phase 3: Advanced Features (Q2 2026)

**Status:** 📋 Planned  
**Target:** April-May 2026

> Items partially absorbed by SaaS Platform plan. Remaining standalone items:

**Goals:**

- [ ] Two-factor authentication (2FA)
- [ ] API versioning
- [ ] ~~Admin dashboard backend~~ → SaaS Phase 3/4
- [ ] ~~Redis caching layer~~ → SaaS Phase 2
- [ ] Advanced logging and monitoring
- [ ] Performance optimization

---

### 📅 Phase 4: Scale & Extend (Q2-Q3 2026)

**Status:** 📋 Planned  
**Target:** June-August 2026

**Goals:**

- [ ] Additional OAuth providers (GitHub, Microsoft)
- [ ] Webhook system
- [ ] ~~Role-based access control (RBAC)~~ → SaaS Phase 3c (admin/user roles)
- [ ] GraphQL API (optional)
- [ ] Multi-region deployment
- [ ] Load testing and optimization

---

### 📅 Phase 5: Ecosystem (Q3-Q4 2026)

**Status:** 💡 Future  
**Target:** September 2026+

**Goals:**

- [ ] SDK for popular frameworks (React, Vue, Angular)
- [ ] CLI tool for org/app management
- [ ] Admin web dashboard (config portal frontend)
- [ ] Mobile app support
- [ ] Analytics and reporting
- [ ] Comprehensive examples and tutorials

---

## Key Metrics & Goals

### Performance Targets

- Response time: < 100ms (95th percentile)
- Throughput: > 1000 req/sec
- Uptime: 99.9%
- Zero downtime deployments

### Security Targets

- Zero critical vulnerabilities
- All major security features implemented
- Regular security audits (CodeQL SAST, Trivy container scanning)
- Compliance with OWASP top 10

### Quality Targets

- Test coverage: ≥ 90% (achieved ✅)
- Code quality score: A
- Documentation coverage: > 90%
- Zero known bugs in production

### Adoption Targets

- 100+ GitHub stars
- 10+ production deployments
- Active community contributors
- Comprehensive documentation

---

## Technology Stack

### Current Stack (Phase 1-2)

- TypeScript 5.9 (strict mode)
- Node.js 20
- Express 5
- MongoDB 7 (Mongoose 9)
- Docker + Traefik reverse proxy
- Vitest (testing, ≥90% coverage)
- Zod (input validation)
- Helmet (security headers)

### Planned Additions

- **SaaS Phase 1:** `jose` or `jsonwebtoken` RS256 signing
- **SaaS Phase 2:** Redis 7 (token denylist, caching)
- **SaaS Phase 3:** Nodemailer (email), domain event bus
- **Phase 3:** `otplib` (TOTP 2FA)
- **Phase 4:** GraphQL (optional)
- **Phase 5:** React/Vue (admin UI), CLI tool

---

## Decision Points

### Architecture Decisions

- **Monolith vs Microservices:** Monolith with domain event bus (SaaS Phase 3e) as migration path to microservices
- **SQL vs NoSQL:** MongoDB for flexibility; event bus allows future CQRS if needed
- **REST vs GraphQL:** REST primary, GraphQL optional in Phase 4
- **JWT Signing:** RS256 (asymmetric) — enables third-party local verification via JWKS
- **Caching Strategy:** Redis for token denylist (SaaS Phase 2), general caching later
- **Multi-tenancy:** Organisation → Application → User hierarchy; users global to org

### Technology Choices

- **Testing:** Vitest (already in use, fast, ESM-native)
- **Email Service:** Nodemailer (MVP) → SendGrid/SES (production)
- **Event Bus:** In-process EventEmitter (MVP) → Redis/SQS (scale)
- **Documentation:** Swagger/OpenAPI for API, Markdown for guides

---

## Risk Management

### Technical Risks

| Risk                         | Impact   | Mitigation                                              |
| ---------------------------- | -------- | ------------------------------------------------------- |
| Scaling issues               | High     | Load testing, horizontal scaling, Redis caching         |
| Security vulnerabilities     | Critical | Regular audits, CodeQL SAST, Trivy scanning, Dependabot |
| Database performance         | Medium   | Indexing, query optimization, Redis cache layer         |
| Third-party service downtime | Medium   | Graceful degradation, fallbacks, monitoring             |
| RS256 key management         | High     | Secure key storage, rotation procedure, JWKS endpoint   |

### Project Risks

| Risk              | Impact | Mitigation                                             |
| ----------------- | ------ | ------------------------------------------------------ |
| Scope creep       | Medium | Clear milestones, prioritized backlog, phased delivery |
| Technical debt    | Medium | Regular refactoring, code reviews, dependency-cruiser  |
| Documentation lag | Low    | Documentation-first approach, templates, docs skill    |
| Breaking changes  | Medium | API versioning, deprecation warnings                   |

---

## Success Criteria

### Phase 2 Success (nearly complete)

- ✅ Rate limiting implemented
- ✅ Refresh tokens with reuse detection
- ✅ Test coverage ≥ 90%
- ✅ Security audit completed
- ⬜ Email verification (moved to SaaS plan)
- ⬜ Password reset flow

### SaaS Platform Success

- RS256 + JWKS endpoint serving public keys
- Multi-tenant model with org/app hierarchy
- Token introspection endpoint (RFC 7662)
- Feature-flagged access token revocation via Redis
- Per-application configuration portal (API)
- Audit logging for regulatory compliance
- Automated provisioning (org → default app → credentials email)

### Overall Success

- Production-ready multi-tenant authentication platform
- Third-party servers can verify tokens locally via JWKS
- Self-service org registration with email verification
- Active user base (10+ deployments)
- Comprehensive documentation and integration guides

---

## Review Schedule

- **Weekly:** Progress review and blocker identification
- **Monthly:** Milestone assessment and backlog refinement
- **Quarterly:** Roadmap review and adjustment
- **Annually:** Long-term vision and strategy

---

## Contributing to Roadmap

Have ideas for the roadmap? Consider:

1. Is it aligned with the SaaS platform vision?
2. Does it solve a real problem for third-party integrators?
3. Is it feasible with current resources?
4. Does it fit within a milestone?

Add suggestions to the [Backlog](./backlog.md) with priority and effort estimates.

---

**Last Updated:** 2026-03-03  
**Current Phase:** Phase 2 (4/6 complete), SaaS Platform plan approved  
**Next Review:** 2026-03-31
