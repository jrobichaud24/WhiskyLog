# Overview

The Dram Journal is a Progressive Web Application (PWA) designed for whisky enthusiasts to track, rate, and discover exceptional single malt scotch whiskies. The application allows users to build personal collections, write detailed tasting notes, rate whiskies, and connect with fellow enthusiasts through a community-driven platform. The application will be hosted at www.thedramjournal.com.

The app is built as a full-stack TypeScript application with a React frontend and Express backend, designed to work both online and offline with PWA capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Distilleries List Enhancement & Filtering System (August 19, 2025)
- Implemented comprehensive sorting functionality: distilleries sorted by region first, then alphabetically by name
- Added region headers with amber styling for visual organization and better navigation
- Converted distilleries display from tile grid to organized list format with full descriptions
- Enhanced list view to show name, region, founding year, website, country, status, and descriptions
- Successfully imported and organized 170+ distilleries with proper validation and sorting
- Added comprehensive filtering system with three filter categories:
  * Region filter (Highland, Islay, Speyside, Islands, etc.)
  * Country filter (Scotland, Japan, etc.) 
  * Status filter (Active, Closed, etc.)
- Implemented live count display showing filtered vs total results
- Added "Clear Filters" button that appears when filters are active
- Created smart empty states with different messages for "no matches" vs "no data"
- Filters work in combination and maintain region-based sorting structure

## Authentication System Implementation (August 18, 2025)
- Implemented complete user authentication system with PostgreSQL database
- Created signup, login, password reset, and dashboard pages
- Fixed API request function to properly handle POST requests with JSON bodies
- Added session-based authentication with secure cookie handling
- Integrated custom logo assets provided by user
- Connected navigation "Get Started" buttons to signup flow
- Database schema includes users table with username, email, password (hashed), and timestamps
- All authentication pages feature Scottish Highland theme with amber/gold branding

## Dashboard Design Enhancement (August 18, 2025)
- Redesigned dashboard with premium Scottish Highland aesthetic matching main page
- Added sophisticated dark hero header with subtle pattern overlay and large logo
- Created elegant card designs with gradient backgrounds, glass effects, and shadows
- Enhanced whisky discovery section with hover animations and premium styling
- Upgraded typography using Playfair Display for refined elegance
- Added dark theme stat cards with amber accents and better visual hierarchy
- Improved button styling with gradients and enhanced user interactions
- User confirmed authentication system working perfectly with all flows tested

## Database Infrastructure Implementation (August 18, 2025)
- Created comprehensive database schema for distilleries and products tables
- Added separate distilleries table with fields for name, region, country, founding year, status, and descriptions
- Added products table with detailed whisky information including age, ABV, cask type, vintage, pricing
- Implemented bulk loading capabilities for spreadsheet imports via API endpoints
- Added API routes for CRUD operations on distilleries and products
- Created bulk import endpoints (/api/distilleries/bulk and /api/products/bulk) for spreadsheet loading
- Updated storage interface to handle new data structures with proper validation
- Database supports referential integrity between distilleries and products

## CSV Bulk Import System (August 18, 2025)
- Added comprehensive CSV-to-JSON conversion utility in admin panel
- Created file upload interface with drag-and-drop for CSV and JSON files
- Implemented smart field type conversion (numbers, booleans, defaults)
- Added data preview functionality to verify conversions before import
- Created dual-mode import: CSV file upload OR JSON text paste
- Enhanced error handling with detailed validation messages
- Added distillery ID helper for products import with visual mapping
- Successfully tested with sample CSV files containing 5+ records each
- CSV format supports all database fields with intelligent parsing

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