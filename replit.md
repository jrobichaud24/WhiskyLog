# Overview

WhiskyVault is a Progressive Web Application (PWA) designed for whisky enthusiasts to track, rate, and discover exceptional single malt scotch whiskies. The application allows users to build personal collections, write detailed tasting notes, rate whiskies, and connect with fellow enthusiasts through a community-driven platform.

The app is built as a full-stack TypeScript application with a React frontend and Express backend, designed to work both online and offline with PWA capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **UI Framework**: Radix UI components with Tailwind CSS for styling and shadcn/ui component system
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Styling**: Tailwind CSS with custom CSS variables for theming, includes custom whisky-themed color palette
- **PWA Features**: Service worker for offline functionality, web app manifest for installability

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL (via @neondatabase/serverless)
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot reloading with Vite integration for full-stack development

## Data Storage Solutions
- **Primary Database**: PostgreSQL with three main entities:
  - `users`: User authentication and profile data
  - `whiskies`: Whisky catalog with distillery, region, age, ABV, and tasting information
  - `user_whiskies`: Junction table linking users to whiskies with ratings, tasting notes, and collection status
- **Session Storage**: PostgreSQL sessions using connect-pg-simple
- **Development Storage**: In-memory storage implementation for development/testing

## Authentication and Authorization
- Session-based authentication using Express sessions
- PostgreSQL session store for persistence
- User management with unique username and email constraints
- Password storage (implementation details not visible in current codebase)

## External Dependencies
- **Database**: Neon serverless PostgreSQL for production data storage
- **Fonts**: Google Fonts integration (Playfair Display for headings, Inter for body text)
- **Images**: Unsplash for hero section imagery
- **Icons**: Lucide React for consistent iconography throughout the app
- **Development Tools**: Replit-specific plugins for development environment integration

## API Structure
- RESTful API design with `/api` prefix
- CRUD operations for whiskies (`/api/whiskies`)
- User-specific whisky operations (`/api/user-whiskies/:userId`)
- Comprehensive error handling with structured JSON responses
- Request logging middleware for debugging and monitoring

## Progressive Web App Features
- Service worker for offline caching and functionality
- Web app manifest for native app-like installation
- Responsive design optimized for both mobile and desktop experiences
- Offline-first architecture with local storage fallbacks

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout the stack, and optimized for both developer experience and end-user performance.