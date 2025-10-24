# Overview

The Dram Journal is a Progressive Web Application (PWA) designed for whisky enthusiasts to track, rate, and discover exceptional single malt scotch whiskies. The application allows users to build personal collections, write detailed tasting notes, rate whiskies, and connect with fellow enthusiasts through a community-driven platform. The application is built as a full-stack TypeScript application with a React frontend and Express backend, designed to work both online and offline with PWA capabilities, and will be hosted at www.thedramjournal.com.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite.
- **Routing**: Wouter.
- **UI Framework**: Radix UI components with Tailwind CSS for styling and shadcn/ui component system.
- **State Management**: TanStack Query (React Query) for server state management and caching.
- **Styling**: Tailwind CSS with custom CSS variables for theming, including a custom whisky-themed color palette.
- **PWA Features**: Service worker for offline functionality, web app manifest for installability, offline-first architecture with local storage fallbacks, background sync, and push notifications.

## Backend Architecture
- **Framework**: Express.js with TypeScript.
- **Database ORM**: Drizzle ORM configured for PostgreSQL.
- **Database Provider**: Neon serverless PostgreSQL (via @neondatabase/serverless).
- **Validation**: Zod schemas for request/response validation.
- **Development**: Hot reloading with Vite integration for full-stack development.

## Data Storage Solutions
- **Primary Database**: PostgreSQL with main entities:
  - `users` - User authentication and profiles
  - `distilleries` - Master list of Scottish distilleries
  - `products` - Whisky products catalog with comprehensive details and tasting notes
  - `user_products` - Junction table tracking user collections, ratings, and tasting notes
  - `badges` - Achievement badges system
  - `user_badges` - User badge progress tracking
  - `app_reviews` - User reviews and ratings of the app
- **Session Storage**: PostgreSQL sessions using connect-pg-simple.
- **Development Storage**: In-memory storage for development/testing.

## Authentication and Authorization
- Session-based authentication using Express sessions with a PostgreSQL session store for persistence.
- User management with unique username and email constraints.
- Admin functionality including `isAdmin` flag, protected routes via admin middleware, and initial admin setup/management.
- Persistent login sessions with configurable durations (24-hour standard, 30-day "Remember Me" with rolling refresh).

## API Structure
- RESTful API design with `/api` prefix.
- CRUD operations for products, distilleries, and user-specific product operations.
- Featured products endpoint (`/api/products/featured`) for home page display.
- Comprehensive error handling with structured JSON responses.
- Request logging middleware.
- Bulk import endpoints for distilleries and products via CSV/JSON.
- TheWhiskyEdition API integration for automated whisky database imports.

## PWA Implementation
- **Service Worker Registration**: Comprehensive lifecycle logging with emoji-prefixed console messages for easy debugging and monitoring.
  - Async registration helper with detailed state tracking (installing, waiting, active)
  - Automatic update detection with hourly polling
  - Graceful degradation when service workers unavailable
  - Exported helper functions (getServiceWorkerRegistration, waitForServiceWorker, unregisterServiceWorker)
  - Detailed error handling with specific error type detection and debugging suggestions
- **Offline Support**: Full offline functionality with service worker caching and local storage fallbacks.
- **Installability**: Web app manifest enables installation as native app on mobile and desktop devices.

## Key Features
- **Progressive Web App (PWA)**: Full offline capabilities, installable as a native app on devices.
- **Persistent Login Sessions**: Enhanced user experience with "Keep me signed in" option.
- **App Reviews System**: Star ratings and comments with authentication.
- **Contact Form**: Dedicated contact page with form validation for user inquiries and feedback.
- **Scottish Region Imagery**: Authentic landscape images for 6 whisky regions.
- **User Collection Page**: Dedicated page to display and manage user's owned whiskies with remove functionality.
- **Database Cleanup (Oct 2025)**: Removed deprecated `whiskies` and `user_whiskies` tables, migrated fully to `products` and `user_products` schema.
- **Dynamic Distillery Showcase**: Displays real distillery counts from the database, integrated with React Query.
- **Products Table Schema**: Redesigned to include comprehensive tasting notes and product details.
- **User Administration System**: Admin roles, protected routes, and user promotion/demotion.
- **Distilleries List & Filtering**: Comprehensive sorting by region/name, filtering by region, country, and status, with dynamic counts and detailed descriptions.
- **Authentication System**: Complete user signup, login, password reset, and dashboard integration with secure session handling.
- **Dashboard Design**: Premium Scottish Highland aesthetic with sophisticated UI elements.
- **CSV Bulk Import System**: Admin utility for CSV-to-JSON conversion with drag-and-drop, data preview, and intelligent parsing.
- **TheWhiskyEdition API Import**: One-click admin tool to import 400+ whiskies from TheWhiskyEdition.com database with automatic duplicate detection, batch processing (50 per batch), timeout handling (90s client, 10s per request), and comprehensive error reporting.

# External Dependencies

- **Database**: Neon serverless PostgreSQL.
- **Fonts**: Google Fonts (Playfair Display, Inter).
- **Images**: Unsplash for hero sections.
- **Icons**: Lucide React.
- **Development Tools**: Replit-specific plugins.
- **External APIs**: TheWhiskyEdition.com API (https://thewhiskyedition.com/openapi.yaml) for whisky product database imports.