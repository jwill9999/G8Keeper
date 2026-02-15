# Clean Architecture Guidelines

This document defines the architectural rules, layer responsibilities, and file placement conventions for this codebase. **All contributors and AI agents must follow these rules when adding or modifying code.**

---

## Dependency Direction

```
Domain ← Application ← Infrastructure
                ↑
           Interface (HTTP)
```

Arrows point inward. Outer layers depend on inner layers. Inner layers **never** depend on outer layers.

---

## Layer Map

| Layer | Location | May Import | Must NOT Import |
|-------|----------|------------|-----------------|
| **Domain** | `src/domain/` | Nothing outside `src/domain/` | application, infrastructure, interfaces, any npm package (express, mongoose, bcrypt, jwt) |
| **Application** | `src/application/` | `src/domain/` only | infrastructure, interfaces, any npm package (express, mongoose, bcrypt, jwt) |
| **Infrastructure** | `src/infrastructure/` | `src/domain/`, `src/application/` | `src/interfaces/` |
| **Interface** | `src/interfaces/` | `src/application/`, `src/domain/` (types only) | `src/infrastructure/` |
| **Config** | `src/config/` | Nothing (reads `process.env`) | business logic, domain types |
| **Composition Root** | `src/server.ts` | Everything (wires layers) | Should not contain business logic |

---

## Folder Structure

```
src/
├── domain/
│    └── auth/
│         ├── User.ts              # Entity
│         ├── AuthToken.ts         # Value object
│         └── errors.ts            # Domain errors
│
├── application/
│    └── auth/
│         ├── ports/
│         │     ├── UserRepository.ts    # Interface for data access
│         │     ├── TokenProvider.ts      # Interface for JWT
│         │     └── PasswordHasher.ts    # Interface for hashing
│         ├── use-cases/
│         │     ├── RegisterUser.ts      # Registration flow
│         │     └── LoginUser.ts         # Login flow
│         └── dtos/
│               ├── RegisterDTO.ts       # Input shape for register
│               └── LoginDTO.ts          # Input shape for login
│
├── infrastructure/
│    └── auth/
│         ├── database/
│         │     └── mongo.ts             # MongoDB connection
│         ├── repositories/
│         │     └── MongoUserRepository.ts  # UserRepository impl
│         └── providers/
│               ├── JwtTokenProvider.ts     # TokenProvider impl
│               ├── BcryptPasswordHasher.ts # PasswordHasher impl
│               └── passport.ts            # Google OAuth strategy
│
├── interfaces/
│    └── http/
│         ├── controllers/
│         │     ├── AuthController.ts       # Auth route handlers
│         │     └── ProtectedController.ts  # Protected route handlers
│         ├── middleware/
│         │     ├── AuthMiddleware.ts       # JWT verification middleware
│         │     └── logger.ts              # Morgan request logging
│         ├── routes.ts                    # Route wiring
│         └── swagger.ts                   # OpenAPI spec
│
├── config/
│    └── env.ts              # Reads env vars, exports typed config object
│
└── server.ts                # Composition root — wires everything
```

---

## Where to Put New Code

### Adding a new entity or value object
→ `src/domain/<bounded-context>/`

### Adding a new use case
→ `src/application/<bounded-context>/use-cases/`

### Adding a new port (interface for an external dependency)
→ `src/application/<bounded-context>/ports/`

### Adding a new DTO
→ `src/application/<bounded-context>/dtos/`

### Implementing a port (database, API client, third-party SDK)
→ `src/infrastructure/<bounded-context>/`

### Adding a new HTTP endpoint
→ Create or update a controller in `src/interfaces/http/controllers/`
→ Register it in `src/interfaces/http/routes.ts`
→ Wire the use case in `src/server.ts`

### Adding middleware (auth, rate limiting, logging)
→ `src/interfaces/http/middleware/`

### Adding a new bounded context (e.g., `billing`)
→ Mirror the `auth` structure:
```
src/domain/billing/
src/application/billing/ports/
src/application/billing/use-cases/
src/application/billing/dtos/
src/infrastructure/billing/
src/interfaces/http/controllers/BillingController.ts
```

---

## Strict Rules

1. **Domain is pure.** No framework imports. No I/O. No `process.env`. Only plain TypeScript classes, interfaces, and errors.

2. **Application defines ports.** Use cases depend on port interfaces, never on concrete implementations (e.g., `UserRepository`, not `MongoUserRepository`).

3. **Infrastructure implements ports.** This is where mongoose, bcrypt, jsonwebtoken, and other libraries live. Infrastructure files must `implements` a port interface.

4. **Interface is the HTTP adapter.** Express types (`Request`, `Response`, `Router`) are only allowed here. Controllers call use cases and map domain errors to HTTP status codes.

5. **Composition root wires everything.** `server.ts` instantiates infrastructure, injects it into use cases, and passes use cases into controllers. No business logic here.

6. **No cross-layer shortcuts.** A controller must never import a repository implementation. A use case must never import Express types.

---

## Error Handling Pattern

Domain defines errors:
```ts
// src/domain/auth/errors.ts
export class InvalidCredentialsError extends Error { ... }
export class UserAlreadyExistsError extends Error { ... }
export class ValidationError extends Error { ... }
```

Use cases throw domain errors. Controllers catch and map them:
```ts
// In controller
if (error instanceof ValidationError) → 400
if (error instanceof UserAlreadyExistsError) → 400
if (error instanceof InvalidCredentialsError) → 401
else → next(error) // 500 via Express error handler
```

---

## Dependency Injection Pattern

Constructor injection only. No service locators. No global singletons.

```ts
// Use case receives ports via constructor
class LoginUser {
  constructor(
    private userRepo: UserRepository,       // port, not MongoUserRepository
    private passwordHasher: PasswordHasher, // port, not BcryptPasswordHasher
    private tokenProvider: TokenProvider     // port, not JwtTokenProvider
  ) {}
}
```

Wiring happens in `server.ts`:
```ts
const userRepo = new MongoUserRepository();
const tokenProvider = new JwtTokenProvider(config.jwtSecret);
const passwordHasher = new BcryptPasswordHasher();

const loginUser = new LoginUser(userRepo, passwordHasher, tokenProvider);
```

---

## Boundary Enforcement

Boundaries are enforced by [dependency-cruiser](https://github.com/sverweij/dependency-cruiser).

Run the check:
```bash
npm run lint:deps
```

Configuration: `.dependency-cruiser.cjs`

Rules enforced:
| From | Cannot Import | 
|------|---------------|
| `src/domain/` | `src/application/`, `src/infrastructure/`, `src/interfaces/` |
| `src/application/` | `src/infrastructure/`, `src/interfaces/` |
| `src/infrastructure/` | `src/interfaces/` |
| `src/domain/`, `src/application/`, `src/infrastructure/` | `express` |
| `src/domain/`, `src/application/`, `src/interfaces/` | `mongoose` |

A violation will cause `npm run lint:deps` to exit with a non-zero code.

---

## Testing Strategy

| Layer | Test Type | Mocks Needed | Location |
|-------|-----------|--------------|----------|
| Domain | Unit tests | None | `tests/domain/` |
| Application | Unit tests | Ports (UserRepository, TokenProvider, PasswordHasher) | `tests/application/` |
| Infrastructure | Integration tests | Real DB (test container) | `tests/infrastructure/` |
| Interface | HTTP tests | Use cases (or full stack with supertest) | `tests/interfaces/` |

---

## Checklist Before Merging

- [ ] New code is in the correct layer
- [ ] No prohibited imports (run `npm run lint:deps`)
- [ ] Use cases depend on ports, not implementations
- [ ] Controllers don't contain business logic
- [ ] Domain has no external dependencies
- [ ] New ports have corresponding implementations
- [ ] Wiring is done in `server.ts`
- [ ] TypeScript compiles cleanly (`npm run build`)

---

*Last Updated: 2026-02-15*
