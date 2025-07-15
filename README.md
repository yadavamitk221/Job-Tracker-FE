# Job Import System - MERN Stack

A scalable job import system that fetches jobs from multiple external APIs, processes them asynchronously using Redis queues, and provides an admin interface for monitoring import history.

## 🚀 Features

- **Multi-source Job Fetching**: Integrates with multiple job APIs (XML-based)
- **Asynchronous Processing**: Uses Redis + Bull queues for background job processing
- **Import Tracking**: Comprehensive logging of import statistics and failures
- **Admin Dashboard**: Next.js frontend for monitoring import history
- **Scalable Architecture**: Modular design ready for microservices

## 🧰 Tech Stack

- **Frontend**: Next.js 14 (React 18)
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Queue System**: Redis with Bull
- **Deployment**: Docker ready

## 📁 Project Structure

```
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Next.js pages
│   │   └── lib/           # Utilities and API clients
│   ├── package.json
│   └── next.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # MongoDB models
│   │   ├── queues/         # Bull queue configurations
│   │   ├── workers/        # Background job processors
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── app.js
├── docs/
│   └── architecture.md     # System design documentation
├── docker-compose.yml      # Docker setup
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Docker (optional)

### Environment Variables

Create `.env` files in both `client/` and `server/` directories:

**server/.env**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-import-system
REDIS_URL=redis://localhost:6379
NODE_ENV=development
IMPORT_INTERVAL_HOURS=1
QUEUE_CONCURRENCY=5
BATCH_SIZE=100
```

**client/.env.local**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Installation & Running

#### Option 1: Manual Setup

1. **Install dependencies**

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

2. **Start services**

```bash
# Start MongoDB and Redis locally
# Or use cloud services

# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev

# Start worker process (from server directory)
npm run worker
```

#### Option 2: Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Run mongoDb and redis.
docker-compose up mongodb redis -d
```

### API Endpoints

- `GET /api/jobs` - Fetch all jobs
- `GET /api/import-logs` - Get import history
- `POST /api/import/trigger` - Manually trigger import
- `GET /api/import/status` - Get current import status

### Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🔧 Configuration

### Job Sources

The system fetches from these APIs:

- Jobicy main feed
- Jobicy category-specific feeds (SMM, Design, Data Science, etc.)
- HigherEdJobs RSS feed

### Queue Configuration

- **Concurrency**: Configurable via `QUEUE_CONCURRENCY` env var
- **Retry Logic**: Exponential backoff with 3 attempts
- **Batch Processing**: Configurable batch size for DB operations

## 📊 Monitoring

The admin dashboard provides:

- Import history with detailed statistics
- Real-time status updates
- Error logs and failure reasons
- Performance metrics

## 🚀 Deployment

### Using Docker

```bash
# Production build
docker-compose -f docker-compose.prod.yml up --build
```

### Manual Deployment

1. Build frontend: `cd client && npm run build`
2. Deploy backend to your preferred platform
3. Configure environment variables for production
4. Set up MongoDB and Redis instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

MIT License
