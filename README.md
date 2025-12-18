# LIS GPB Backend

Backend API for LIS GPB platform built with NestJS, TypeORM, and Oracle Database.

## 🚀 Features

- **Layered Architecture** with 3-layer structure
- **CQRS Pattern** for separation of commands and queries
- **JWT Authentication** with role-based authorization
- **Oracle Database** integration with TypeORM
- **DataLoader Pattern** for N+1 query optimization
- **Rate Limiting** with Redis-based throttling
- **Advanced Caching** strategies
- **Docker** containerization
- **Comprehensive Testing** with Jest

## 📋 Prerequisites

- Node.js 18+
- Oracle Database 12c+
- Redis (for caching and rate limiting)
- Docker (optional)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd lis-gpb-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Database Setup**
- Ensure Oracle Database is running
- Update connection details in `.env`
- Run migrations (if any)

5. **Start the application**
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 🐳 Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Build only
docker build -t lis-gpb-backend .
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### User Endpoints (Protected)
- `GET /users` - Get users list
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PATCH /users/:id/activate` - Activate user

### Health Check
- `GET /health` - Application health status

## 🔧 Configuration

### Environment Variables
```bash
# Database
DB_HOST=192.168.7.248
DB_PORT=1521
DB_USERNAME=HIS_RS
DB_PASSWORD=HIS_RS
DB_SERVICE_NAME=orclstb

# JWT
JWT_SECRET=your-super-secret-key-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── app.module.ts
├── main.ts
├── common/
│   └── builders/
│       └── response.builder.ts
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── oracle-naming.strategy.ts
├── shared/
│   └── dataloaders/
│       ├── dataloader.module.ts
│       └── dataloader.service.ts
└── modules/
    ├── user/
    │   ├── entities/
    │   ├── interfaces/
    │   ├── dto/
    │   │   ├── commands/
    │   │   ├── queries/
    │   │   └── responses/
    │   ├── user.controller.ts
    │   ├── user.service.ts
    │   ├── user.repository.ts
    │   └── user.module.ts
    └── auth/
        ├── dto/
        ├── guards/
        ├── strategies/
        ├── auth.controller.ts
        ├── auth.service.ts
        └── auth.module.ts
```

## 🏗️ Architecture

### Layered Architecture
- **Presentation Layer**: Controllers handle HTTP requests
- **Business Logic Layer**: Services contain business logic with CQRS
- **Data Access Layer**: Repositories handle database operations

### CQRS Pattern
- **Commands**: Methods that change state (create, update, delete)
- **Queries**: Methods that read data (get, find, list, search)

### Database Naming
- **Tables**: `BML_` prefix (e.g., `BML_USERS`)
- **Columns**: UPPERCASE with underscores
- **Indexes**: Oracle 12c 30-character limit

## 🔒 Security

- JWT-based authentication
- Password strength validation
- Rate limiting
- CORS configuration
- Input validation with class-validator

## 📊 Monitoring

- Health check endpoints
- Structured logging
- Error handling with standardized responses
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
