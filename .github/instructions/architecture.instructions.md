---
description: Clean Architecture rules and layer boundaries for the Express Auth API
applyTo: 'src/**/*'
---

# Architecture Instructions

This project follows **Clean Architecture (Hexagonal / Ports & Adapters)**. These rules govern where code lives and what each layer may depend on. Follow them for every code change.

## Dependency Direction

```
Domain ← Application ← Infrastructure
                ↑
           Interface (HTTP)
```

Dependencies always point inward. Inner layers never import from outer layers.

## Layer Rules

### Domain (`src/domain/`)
**Purpose:** Pure business entities, value objects, and domain errors.

- ✅ Plain TypeScript classes and interfaces
- ✅ Business invariants and validation rules intrinsic to the entity
- ❌ Must NOT import from `src/application/`, `src/infrastructure/`, or `src/interfaces/`
- ❌ Must NOT import any npm package (`express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, etc.)
- ❌ Must NOT access `process.env`

**Contains:**
| Type | Example | Location |
|------|---------|----------|
| Entity | `User` | `src/domain/auth/User.ts` |
| Value object | `AuthToken` | `src/domain/auth/AuthToken.ts` |
| Domain error | `InvalidCredentialsError` | `src/domain/auth/errors.ts` |

### Application (`src/application/`)
**Purpose:** Use cases, port interfaces (abstractions for external dependencies), and DTOs.

- ✅ May import from `src/domain/`
- ❌ Must NOT import from `src/infrastructure/` or `src/interfaces/`
- ❌ Must NOT import `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, or any adapter library

**Contains:**
| Type | Example | Location |
|------|---------|----------|
| Port (interface) | `UserRepository`, `TokenProvider`, `PasswordHasher` | `src/application/auth/ports/` |
| Use case | `RegisterUser`, `LoginUser` | `src/application/auth/use-cases/` |
| DTO | `RegisterDTO`, `LoginDTO` | `src/application/auth/dtos/` |

**Key rule:** Use cases receive ports via constructor injection. They depend on interfaces, never on concrete implementations.

### Infrastructure (`src/infrastructure/`)
**Purpose:** Concrete implementations of application ports — database access, third-party SDKs, external APIs.

- ✅ May import from `src/domain/` and `src/application/`
- ✅ This is where `mongoose`, `bcryptjs`, `jsonwebtoken`, `passport` live
- ❌ Must NOT import from `src/interfaces/`

**Contains:**
| Type | Example | Location |
|------|---------|----------|
| DB connection | `connectDB()` | `src/infrastructure/auth/database/mongo.ts` |
| Repository impl | `MongoUserRepository` (implements `UserRepository`) | `src/infrastructure/auth/repositories/` |
| Provider impl | `JwtTokenProvider` (implements `TokenProvider`) | `src/infrastructure/auth/providers/` |
| Provider impl | `BcryptPasswordHasher` (implements `PasswordHasher`) | `src/infrastructure/auth/providers/` |
| OAuth config | `configurePassport()` | `src/infrastructure/auth/providers/passport.ts` |

**Key rule:** Every class here must `implements` a port interface defined in the application layer. Never return raw database documents outside this layer — always map to domain entities.

### Interface (`src/interfaces/`)
**Purpose:** HTTP adapter layer — Express controllers, middleware, routes, and Swagger config.

- ✅ May import from `src/application/` (use cases, ports, DTOs)
- ✅ May import domain types/errors for error mapping
- ✅ Only layer allowed to use `express` types (`Request`, `Response`, `Router`, etc.)
- ❌ Must NOT import from `src/infrastructure/`
- ❌ Must NOT import `mongoose`, `bcryptjs`, or `jsonwebtoken`

**Contains:**
| Type | Example | Location |
|------|---------|----------|
| Controller | `AuthController`, `ProtectedController` | `src/interfaces/http/controllers/` |
| Middleware | `createAuthMiddleware()` | `src/interfaces/http/middleware/AuthMiddleware.ts` |
| Logger | Morgan setup | `src/interfaces/http/middleware/logger.ts` |
| Route wiring | `createRoutes()` | `src/interfaces/http/routes.ts` |
| API docs | Swagger/OpenAPI spec | `src/interfaces/http/swagger.ts` |

**Key rule:** Controllers call use cases and map domain errors to HTTP status codes. They must not contain business logic or query the database directly.

### Config (`src/config/`)
**Purpose:** Read environment variables and export a typed config object.

- ✅ Reads `process.env`
- ❌ Must NOT contain business logic or domain types

### Composition Root (`src/server.ts`)
**Purpose:** Wires all layers together. Instantiates infrastructure, injects into use cases, passes use cases into controllers, mounts Express middleware and routes.

- ✅ May import from every layer (this is the only file that can)
- ❌ Must NOT contain business logic

## Error Handling Pattern

Domain defines errors → use cases throw them → controllers catch and map:

```
ValidationError        → 400
UserAlreadyExistsError → 400
InvalidCredentialsError → 401
Unknown/unhandled      → next(error) → 500 (Express error handler)
```

## Dependency Injection

Constructor injection only. No service locators, no global singletons.

```ts
// In server.ts (composition root):
const userRepo = new MongoUserRepository();           // infrastructure
const tokenProvider = new JwtTokenProvider(secret);    // infrastructure
const passwordHasher = new BcryptPasswordHasher();     // infrastructure

const loginUser = new LoginUser(userRepo, passwordHasher, tokenProvider); // application
const authController = new AuthController(registerUser, loginUser, tokenProvider); // interface
```

## Adding New Code — Decision Table

| I need to... | Put it in... |
|--------------|-------------|
| Add an entity or value object | `src/domain/<context>/` |
| Add a domain error | `src/domain/<context>/errors.ts` |
| Add a use case | `src/application/<context>/use-cases/` |
| Define an interface for an external dependency | `src/application/<context>/ports/` |
| Add a DTO (input/output shape) | `src/application/<context>/dtos/` |
| Implement a port (DB, API, SDK) | `src/infrastructure/<context>/` |
| Add an HTTP endpoint | Controller in `src/interfaces/http/controllers/`, register in `routes.ts`, wire in `server.ts` |
| Add middleware (auth, rate limit) | `src/interfaces/http/middleware/` |
| Add a new bounded context (e.g. `billing`) | Mirror the `auth` folder structure across all four layers |

## Adding a New Bounded Context

When adding a new feature domain (e.g. `billing`), create this structure:

```
src/domain/billing/
src/application/billing/ports/
src/application/billing/use-cases/
src/application/billing/dtos/
src/infrastructure/billing/
src/interfaces/http/controllers/BillingController.ts
```

Wire the new use cases and controller in `server.ts` and register routes in `routes.ts`.

## Boundary Enforcement

Boundaries are enforced by **dependency-cruiser** (config: `.dependency-cruiser.cjs`).

```bash
npm run lint:deps
```

This checks:
- `src/domain/` does not import `application`, `infrastructure`, or `interfaces`
- `src/application/` does not import `infrastructure` or `interfaces`
- `src/infrastructure/` does not import `interfaces`
- `express` is not imported outside `src/interfaces/` and `src/server.ts`
- `mongoose` is not imported outside `src/infrastructure/`

A violation causes a non-zero exit code. Always run this before committing.

## Quick Reference: Prohibited Imports

| From this layer... | ...you must NOT import |
|--------------------|----------------------|
| `src/domain/` | anything outside `src/domain/`, any npm package |
| `src/application/` | `src/infrastructure/`, `src/interfaces/`, `express`, `mongoose`, `bcryptjs`, `jsonwebtoken` |
| `src/infrastructure/` | `src/interfaces/` |
| `src/interfaces/` | `src/infrastructure/`, `mongoose`, `bcryptjs`, `jsonwebtoken` |
