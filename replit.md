# mPocket Payment Portal

## Overview

This is a UPI payment processing application that enables merchants to create payment sessions and receive payments through UPI (Unified Payments Interface). The application provides a clean, mobile-responsive interface for displaying payment QR codes and payment details. Built as a full-stack TypeScript application, it uses React for the frontend and Express for the backend, with a PostgreSQL database for persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and the "new-york" style preset
- **Animations**: Framer Motion for declarative animations
- **QR Code Generation**: qrcode.react library for payment QR codes

**Design System**:
- Uses CSS custom properties for theming (light/dark mode support)
- Custom fonts: Inter for UI, Roboto Mono for monospace elements
- Consistent spacing and color tokens defined in Tailwind config
- Component variants using class-variance-authority for type-safe styling

**Key Design Decisions**:
- Single-page application with minimal routes (payment page and 404)
- Mobile-first responsive design with breakpoint detection
- Toast notifications for user feedback
- Comprehensive UI component library for future extensibility

### Backend Architecture

**Framework**: Express.js with TypeScript
- **HTTP Server**: Native Node.js HTTP server wrapping Express
- **Development Mode**: Vite middleware integration for hot module replacement
- **Request Logging**: Custom middleware for API request/response logging with timing
- **Raw Body Access**: Custom body parser for webhook support (Stripe, payment providers)

**API Design**:
- RESTful endpoints under `/api` prefix
- POST `/api/payments/create` - Creates new payment sessions
- GET `/api/payments/:id` - Retrieves payment session details with expiration validation
- JSON request/response format with structured error handling

**Data Layer Abstraction**:
- `IStorage` interface defines storage contract (getUser, createPaymentSession, etc.)
- `MemStorage` class provides in-memory implementation for development
- Design allows easy swapping to database-backed storage (Drizzle ORM ready)

**Key Design Decisions**:
- Storage abstraction enables testing without database dependency
- Payment sessions expire after 30 minutes by default
- Separation of concerns: routes.ts handles HTTP, storage.ts handles data
- Development and production builds use different serving strategies (Vite vs static)

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL
- **Schema Location**: `shared/schema.ts` for client-server sharing
- **Migration Management**: Drizzle Kit with migrations output to `./migrations`

**Data Models**:

1. **Users Table**
   - UUID primary key with PostgreSQL's `gen_random_uuid()`
   - Username (unique) and password fields
   - Prepared for authentication but not currently implemented

2. **Payment Sessions Table**
   - UUID primary key
   - Amount (integer, likely in smallest currency unit)
   - VPA (Virtual Payment Address) for UPI
   - Merchant name for display
   - Status field (default: "pending")
   - Created and expiration timestamps
   - No foreign keys to users (currently standalone sessions)

**Schema Validation**:
- Zod schemas generated from Drizzle tables using `drizzle-zod`
- Insert schemas exclude auto-generated fields (id, timestamps)
- Type-safe data validation on both client and server

**Key Design Decisions**:
- Shared schema between frontend and backend ensures type consistency
- Database-agnostic storage interface allows development without DB connection
- Environment variable `DATABASE_URL` required for production
- No soft deletes implemented; expired sessions remain in database

### Build and Deployment

**Build Process** (script/build.ts):
1. Clean dist directory
2. Build client with Vite (outputs to `dist/public`)
3. Build server with esbuild (outputs to `dist/index.cjs`)
4. Bundle allowlisted dependencies to reduce cold start times
5. External dependencies not in allowlist remain as node_modules references

**Bundling Strategy**:
- Critical dependencies bundled: database clients, ORMs, authentication
- Development dependencies and large libraries excluded
- Optimized for serverless/edge deployment scenarios

**Development Workflow**:
- `dev:client`: Vite dev server on port 5000
- `dev`: tsx-based development server with hot reload
- `start`: Production server from built artifacts

**Vite Configuration Highlights**:
- Custom plugin for OpenGraph image meta tag injection
- Replit-specific plugins for development (cartographer, dev banner)
- Runtime error modal overlay for better DX
- Path aliases: `@/` for client, `@shared/` for shared code

## External Dependencies

### Core Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL client optimized for edge deployments
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **express**: Web application framework
- **vite**: Frontend build tool and dev server

### UI Framework
- **react**: UI library (v18+)
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library
- **framer-motion**: Animation library

### UI Components (Radix UI)
- Comprehensive set of accessible, unstyled primitives
- Dialog, Dropdown, Popover, Toast, Accordion, and more
- Forms managed with react-hook-form and @hookform/resolvers

### Styling
- **tailwindcss**: Utility-first CSS framework
- **@tailwindcss/vite**: Vite plugin for Tailwind v4
- **class-variance-authority**: Type-safe component variants
- **tailwind-merge**: Utility for merging Tailwind classes

### Development Tools
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration management

### Utilities
- **zod**: Schema validation
- **date-fns**: Date manipulation
- **nanoid**: Unique ID generation
- **qrcode.react**: QR code rendering

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code mapping for Replit
- **@replit/vite-plugin-dev-banner**: Development environment indicator

### Potential Future Dependencies
- **connect-pg-simple**: PostgreSQL session store (imported but not actively used)
- **express-session**: Session middleware (prepared for authentication)
- Authentication libraries like passport (imported but not implemented)