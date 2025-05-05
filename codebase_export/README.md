# FinCity Financial Education App

This directory contains exported code files from the FinCity financial education app project.

The app is a gamified financial education platform for teenagers (ages 12-17), designed to teach financial literacy through interactive gameplay. It combines features similar to Duolingo (level-based learning progression) and Monopoly (virtual city with properties).

## Technology Stack
- Frontend: React, TypeScript, Tailwind CSS, Shadcn UI
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- Authentication: Passport.js with session-based auth
- State Management: React Query

## Project Structure
The code is organized in the following directories:

1. `client/` - Frontend React application
   - `src/components/` - Reusable UI components
   - `src/hooks/` - Custom React hooks
   - `src/lib/` - Utility functions and configurations
   - `src/pages/` - Page components for each route

2. `server/` - Backend Express application
   - `auth.ts` - Authentication setup with Passport.js
   - `routes.ts` - API route definitions
   - `storage.ts` - Database access layer

3. `shared/` - Code shared between frontend and backend
   - `schema.ts` - Database schema definitions with Drizzle ORM

4. `db/` - Database related code
   - `index.ts` - Database connection setup
   - `seed.ts` - Seed data for development

## Feature Overview
- Authentication system with login/register
- Virtual city map with buildings that teach different financial concepts
- Interactive lessons with quizzes
- Virtual currency and economy simulation
- Profile with achievements and progress tracking
- Shop to purchase virtual items

## Getting Started
1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Create `.env` file with `DATABASE_URL` pointing to your PostgreSQL instance
4. Run database migrations: `npm run db:push`
5. Seed the database: `npm run db:seed`
6. Start the development server: `npm run dev`

## Login Credentials (Development)
- Username: demo
- Password: password

## Directory Contents
This export directory contains code files organized by their original location in the project structure.