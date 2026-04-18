# QA Backend System

A RESTful backend API for a Q&A platform built with NestJS, PostgreSQL, Redis, and Docker.

## 🌐 Live Deployment

|                  |                                               |
| ---------------- | --------------------------------------------- |
| **Base URL**     | https://qa-backend-v9rl.onrender.com/api      |
| **Swagger Docs** | https://qa-backend-v9rl.onrender.com/api/docs |
| **Platform**     | [Render](https://render.com)                  |
| **Status**       | ✅ Live                                       |

> ⚠️ **Note:** This service is hosted on Render's free tier. The server may **spin down after 15 minutes of inactivity**. The first request after inactivity may take **30–60 seconds** to respond while the server wakes up.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Request
┌─────────────────────▼───────────────────────────────────┐
│                   NestJS Application                    │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Auth   │  │  Posts  │  │Questions │  │Comments │  │
│  │ Module  │  │ Module  │  │  Module  │  │ Module  │  │
│  └─────────┘  └─────────┘  └──────────┘  └─────────┘  │
│                                                         │
│  ┌─────────┐  ┌─────────┐  ┌──────────────────────┐   │
│  │  Likes  │  │ Upload  │  │  Notifications Module │   │
│  │ Module  │  │ Module  │  │  (BullMQ + Redis)     │   │
│  └─────────┘  └─────────┘  └──────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Prisma ORM (PrismaService)          │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────┬─────────────────────┬───────────────────┘
                │                     │
   ┌────────────▼──────┐   ┌──────────▼──────────┐
   │   PostgreSQL DB   │   │    Redis (BullMQ)    │
   │  (Data Storage)   │   │   (Job Queue)        │
   └───────────────────┘   └─────────────────────┘
```

## 🚀 Tech Stack

| Technology | Version | Purpose           |
| ---------- | ------- | ----------------- |
| NestJS     | 10.x    | Backend framework |
| PostgreSQL | 15      | Primary database  |
| Prisma ORM | 5.x     | Database ORM      |
| Redis      | 7       | Job queue storage |
| BullMQ     | 5.x     | Async job queue   |
| Docker     | -       | Containerization  |
| JWT        | -       | Authentication    |
| Multer     | -       | File upload       |
| Swagger    | -       | API documentation |

## ⚙️ Setup & Installation (Local Development)

### Prerequisites

- Node.js >= 18
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/hhuyyyyyy13012004/qa-backend.git
cd qa-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the file `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then, adjust the values in `.env` to suit your environment.

### 4. Start Docker services (PostgreSQL + Redis)

```bash
docker compose up -d
```

If you want to run locally without Redis, set `NOTIFICATIONS_QUEUE_ENABLED=false`.
In that mode, notifications are written directly to PostgreSQL instead of going through BullMQ.

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Create uploads directory

```bash
mkdir uploads
mkdir uploads/posts
```

### 7. Start the application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 8. Access the API (local)

- **API Base URL**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

## ☁️ Deploy to Render

### Build Command

```bash
npm install --include=dev && npx prisma generate && npm run build
```

> `--include=dev` is required so that `@nestjs/cli` (in `devDependencies`) is available during the build step.

### Start Command

```bash
npm run start:prod
```

### Environment Variables (Render Dashboard)

Set the following environment variables in your Render service settings:

| Variable       | Description                                      |
| -------------- | ------------------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string                     |
| `REDIS_URL`    | Redis connection string                          |
| `JWT_SECRET`   | Secret key for signing JWT tokens                |
| `PORT`         | Port (Render sets this automatically to `10000`) |

---

## 📁 Project Structure

```
src/
├── auth/                   # JWT Authentication
│   ├── dto/                # Request DTOs
│   ├── strategies/         # Passport JWT Strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── posts/                  # Post management + moderation
│   ├── dto/
│   ├── posts.controller.ts
│   ├── posts.service.ts
│   └── posts.module.ts
├── questions/              # Question management
│   ├── dto/
│   ├── questions.controller.ts
│   ├── questions.service.ts
│   └── questions.module.ts
├── comments/               # Comments & Replies
│   ├── dto/
│   ├── comments.controller.ts
│   ├── comments.service.ts
│   └── comments.module.ts
├── likes/                  # Like & Share system
│   ├── likes.controller.ts
│   ├── likes.service.ts
│   └── likes.module.ts
├── notifications/          # Async notification system
│   ├── processors/         # BullMQ job processor
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   └── notifications.module.ts
├── upload/                 # File upload
│   ├── upload.controller.ts
│   ├── upload.service.ts
│   ├── upload.config.ts
│   └── upload.module.ts
├── prisma/                 # Database service
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/                 # Shared utilities
│   ├── guards/             # JwtAuthGuard, RolesGuard
│   └── decorators/         # @CurrentUser(), @Roles()
└── main.ts                 # Application entry point
```

## 🗄 Database Design

### Entity Relationship Overview

```
User ──< Post ──< Comment
     ──< Question ──< Comment
     ──< Like
     ──< Notification

Comment ──< Comment (self-referencing for replies)
Like >── Post
Like >── Question
```

### Key Design Decisions

**1. Nullable Foreign Keys in Comment**
Comment uses nullable `postId` and `questionId` instead of separate tables (`PostComment`, `QuestionComment`). This keeps the schema simple while supporting both content types.

**2. Unique Constraints on Like**

```sql
UNIQUE(userId, postId)
UNIQUE(userId, questionId)
```

Database-level constraint prevents duplicate likes without application-level checks.

**3. Self-referencing Comment**
`parentId` on Comment enables 1-level reply threading without a separate Reply table.

**4. JSON metadata on Notification**
Flexible `metadata: Json?` field stores context (postId, reason) without adding columns per notification type.

## 🔐 Authentication & RBAC

### JWT Flow

```
POST /api/auth/login
  → Verify credentials
  → Sign JWT { sub: userId, email, role }
  → Return accessToken

Subsequent requests:
  Authorization: Bearer <token>
  → JwtStrategy.validate()
  → Attach user to request
  → RolesGuard checks role
```

### Role-Based Access Control

```typescript
// Applied via decorators — no hardcoded logic
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Patch(':id/approve')
approve() { ... }
```

| Route                  | USER | ADMIN |
| ---------------------- | ---- | ----- |
| Create post/question   | ✅   | ✅    |
| Submit post for review | ✅   | ✅    |
| Approve/Reject post    | ❌   | ✅    |
| View all posts (admin) | ❌   | ✅    |
| Like/Comment           | ✅   | ✅    |

## 📝 Post Moderation Workflow

```
DRAFT ──[submit]──> PENDING ──[approve]──> APPROVED
                        │                      │
                    [reject]               [edit]
                        │                      │
                    REJECTED <─────────────────┘
                        │
                     [edit]
                        │
                    PENDING
```

### State Transition Rules

- `DRAFT` → only visible to author
- `DRAFT` → `PENDING` via submit action
- `PENDING` → editable without re-submitting
- `APPROVED` or `REJECTED` → edit → auto revert to `PENDING`
- Only `APPROVED` posts are publicly visible

## 🔔 Notification System

### Architecture

```
PostsService.approve()
  │
  └── notificationsService.queueNotification(data)
            │
            ▼
      Redis Queue (BullMQ)
            │
            ▼ (async, background)
      NotificationProcessor.process()
            │
            ▼
      prisma.notification.create()
```

### Why Async Queue?

Processing notifications synchronously would:

- Slow down the approve/reject response time
- Risk failing the main operation if notification fails
- Make the system harder to scale

With BullMQ:

- Response is immediate (job is queued, not processed)
- Failed jobs retry automatically (3 attempts, exponential backoff)
- Notification processing is decoupled from business logic

### Job Configuration

```typescript
{
  attempts: 3,           // retry up to 3 times on failure
  backoff: {
    type: 'exponential', // wait 2s → 4s → 8s between retries
    delay: 2000,
  },
  removeOnComplete: true, // clean up successful jobs
  removeOnFail: false,    // keep failed jobs for debugging
}
```

## 🎨 Design Patterns Used

### 1. Repository Pattern (via Prisma)

PrismaService acts as a centralized data access layer, keeping database logic out of controllers.

### 2. Dependency Injection

NestJS DI container manages service lifecycles and dependencies automatically.

### 3. Guard Pattern (Chain of Responsibility)

```
Request → JwtAuthGuard → RolesGuard → Controller
```

Each guard has a single responsibility, applied via decorators.

### 4. Producer-Consumer Pattern (BullMQ)

PostsService produces jobs, NotificationProcessor consumes them — fully decoupled.

### 5. DTO Pattern + Validation

All input validated at the boundary via `class-validator` decorators before reaching business logic.

## ⚡ Performance Considerations

### Current Optimizations

- **Selective fields**: Prisma `select` returns only needed fields (e.g., `author: { select: { id, username } }`)
- **Count queries**: `_count` uses SQL COUNT instead of loading all related records
- **Database constraints**: Unique constraints at DB level for likes (faster than app-level checks)
- **Async notifications**: Non-blocking notification processing via job queue

### Recommended Improvements

- **Pagination**: Add `skip/take` to all list endpoints to avoid loading full datasets
- **Caching**: Cache frequently read data (approved posts list) in Redis with TTL
- **Database indexes**: Add indexes on `authorId`, `status`, `createdAt` for faster queries
- **Connection pooling**: Configure Prisma connection pool for high concurrency

## 📈 Scaling Considerations

### Horizontal Scaling

```
Load Balancer
├── NestJS Instance 1  ─┐
├── NestJS Instance 2  ─┼──> PostgreSQL (Primary)
└── NestJS Instance 3  ─┘         │
                                   └──> PostgreSQL (Replica) [read]

All instances share:
├── PostgreSQL (via connection pool)
└── Redis (BullMQ queue + cache)
```

### Future Architecture Upgrades

- **Microservices**: Split Notification into a separate service consuming from the queue
- **Read replicas**: Route GET requests to PostgreSQL read replicas
- **CDN**: Move file uploads to S3/Cloudinary + CDN for image serving
- **WebSockets**: Real-time notifications via Socket.io instead of polling
- **Rate limiting**: Add `@nestjs/throttler` to prevent API abuse
- **Search**: Integrate Elasticsearch for full-text post/question search

## 📖 API Documentation

Full interactive API documentation available at:

```
https://qa-backend-v9rl.onrender.com/api/docs
```

### Key Endpoints Summary

| Method | Endpoint                      | Auth  | Description          |
| ------ | ----------------------------- | ----- | -------------------- |
| POST   | `/api/auth/register`          | -     | Register new user    |
| POST   | `/api/auth/login`             | -     | Login, get JWT token |
| GET    | `/api/auth/me`                | JWT   | Get current user     |
| POST   | `/api/posts`                  | JWT   | Create post (DRAFT)  |
| PATCH  | `/api/posts/:id/submit`       | JWT   | Submit for review    |
| PATCH  | `/api/posts/:id/approve`      | ADMIN | Approve post         |
| PATCH  | `/api/posts/:id/reject`       | ADMIN | Reject post          |
| POST   | `/api/questions`              | JWT   | Create question      |
| POST   | `/api/comments`               | JWT   | Comment or reply     |
| POST   | `/api/posts/:id/like`         | JWT   | Toggle like          |
| POST   | `/api/upload/posts/:id/image` | JWT   | Upload image         |
| GET    | `/api/notifications`          | JWT   | Get notifications    |
