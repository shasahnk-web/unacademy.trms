# Replit.md

## Overview

This is a full-stack educational platform application built with React, Express, and PostgreSQL. The application manages educational batches, courses, and related content for online learning platforms. It features a modern UI built with shadcn/ui components, external API integration with https://studyuk.fun/um.php for real-time data synchronization, and follows a clean separation between client-side and server-side code.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation of concerns:

- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for database operations
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: Comprehensive shadcn/ui component library
- **State Management**: TanStack Query for server state caching and synchronization
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL accessed via Drizzle ORM
- **API Design**: RESTful endpoints with proper error handling
- **Middleware**: Custom logging and error handling middleware
- **Development**: Hot reload support with tsx

### Database Schema
The application uses four main tables:
- **batches**: Stores educational batch information including metadata and teacher data
- **batch_items**: Stores individual video items/content within batches with teacher associations
- **api_responses**: Caches external API responses for performance tracking
- **users**: Legacy user management (minimal usage)

### External API Integration
- **StudyUK API**: Integrates with https://studyuk.fun/um.php?batch_id={batch_id}
- **Data Sync**: Real-time synchronization of video content and teacher information
- **Upsert Logic**: Prevents duplicate data while maintaining data integrity
- **Response Caching**: All API responses are logged for performance monitoring

## Data Flow

1. **Client Requests**: Frontend makes API calls through TanStack Query
2. **Server Processing**: Express routes handle requests and interact with the database
3. **External API Sync**: Real-time data synchronization with StudyUK API endpoints
4. **Database Operations**: Drizzle ORM provides type-safe database interactions with upsert logic
5. **Response Caching**: All API responses (internal and external) are cached for performance
6. **State Updates**: TanStack Query manages client-side cache updates and invalidation

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for Neon PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-kit for migrations
- **UI Components**: Extensive Radix UI primitives via shadcn/ui
- **State Management**: @tanstack/react-query for server state
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **Build**: Vite with React plugin and runtime error overlay
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint integration through Vite
- **Development**: tsx for TypeScript execution in development

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds the React application to `dist/public`
2. **Backend Build**: esbuild bundles the Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit handles schema migrations

### Environment Configuration
- **DATABASE_URL**: Required for PostgreSQL connection
- **NODE_ENV**: Controls development vs production behavior
- **REPL_ID**: Enables Replit-specific development features

### Production Deployment
- Single Node.js process serving both API and static files
- Vite development server only active in development
- Proper error handling and logging for production environments
- Database migrations run via `npm run db:push`

The architecture prioritizes type safety, developer experience, and maintainability while providing a solid foundation for educational content management.