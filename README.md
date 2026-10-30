# InnerPeace — Backend

NestJS + TypeORM + PostgreSQL backend API for the InnerPeace platform.

## Tech Stack

- **Framework**: NestJS (Express) + TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT & Passport
- **Documentation**: Swagger / OpenAPI (`/api`)
- **Email Service**: Nodemailer
- **Media Storage**: AWS S3 SDK & Sharp

## Prerequisites

- Node.js 20+
- PostgreSQL database

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Update your database credentials, JWT secret, and email configurations in `.env`.

### 3. Run the application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

API documentation (Swagger) is available at:
`http://localhost:3000/api`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start development server with file watch |
| `npm run build` | Build the project for production |
| `npm run start:prod` | Run the compiled production build |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run ESLint with auto-fix |

## Docker

Build and run the backend image:

```bash
docker build -t innerpeace-backend .
docker run -p 3000:3000 --env-file .env.docker innerpeace-backend
```
