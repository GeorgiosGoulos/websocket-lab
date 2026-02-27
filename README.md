# WebSocket Lab

A WebSocket debugging and testing tool. Connect to any WebSocket endpoint, send and receive messages, and inspect traffic — all from the browser.

Comes with a built-in testing server that exposes WebSocket endpoints with configurable behaviors (echo, auth, delays, streaming, chat) so you can experiment without needing your own server.

## Features

**Frontend (web client)**
- Connect to any `ws://` or `wss://` endpoint
- Send and receive text messages with timestamps
- Bearer token authentication (query parameter)
- First-message token authentication
- Multiple endpoint tabs per connection
- Collections — group endpoints by project, switch between them via sidebar
- Save/import collections as JSON files
- Auto-persistence to localStorage

**Backend (testing server)**

| Endpoint | Behavior |
|---|---|
| `/ws/echo` | Returns exactly what was sent |
| `/ws/echo-with-timestamp` | Returns the message wrapped with a server timestamp |
| `/ws/auth/bearer` | Requires Bearer token (`test-token`) via query param |
| `/ws/auth/token` | Requires `{"type":"auth","token":"test-token"}` as first message |
| `/ws/slow/{delayMs}` | Echoes after a configurable delay (e.g., `/ws/slow/2000`) |
| `/ws/stream/counter` | Sends an incrementing counter every second |
| `/ws/disconnect/after/{n}` | Disconnects after receiving N messages |
| `/ws/chat` | Multi-client chat room — messages broadcast to all connected clients |
| `GET /api/endpoints` | JSON catalog of all available endpoints |

## Quick Start with Docker

The fastest way to run both frontend and backend:

```bash
cd infra
make run
```

This builds and starts both containers. The frontend is available at `http://localhost:3000` and the backend at `http://localhost:8080`.

To stop:

```bash
make stop
```

## Development Setup

### Prerequisites

- Node.js 22+
- JDK 21+
- Docker (optional, for containerized builds)

### Frontend

```bash
cd frontend
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build
npm test          # run tests
```

### Backend

```bash
cd backend
./gradlew bootRun   # run at http://localhost:8080
./gradlew test      # run tests
./gradlew build     # build jar
```

### Make Targets

All Make targets run from the `infra/` directory:

```bash
cd infra
make build-frontend    # npm install + build
make build-backend     # gradle build
make build             # build both
make docker-frontend   # build frontend Docker image
make docker-backend    # build backend Docker image
make docker            # build both Docker images
make all               # build projects + Docker images
make run               # docker-compose up
make stop              # docker-compose down
```

## Tech Stack

**Frontend**
- TypeScript, React 19, Vite 7
- Tailwind CSS 4 for styling
- Vitest + React Testing Library for tests
- Nginx for production serving (Docker)

**Backend**
- Kotlin 2.1, Java 21
- Spring Boot 3.4, Spring WebFlux (reactive WebSockets)
- Gradle (Kotlin DSL) for builds
- JUnit 5 + Mockito for tests

**Infrastructure**
- Docker with multi-stage builds
- docker-compose for local orchestration
- Makefile for common build/run tasks

## Project Structure

```
websocket-lab/
├── frontend/          # React web client
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types.ts       # Shared TypeScript types
│   └── Dockerfile
├── backend/           # Spring Boot WebSocket server
│   ├── src/main/kotlin/com/websocketlab/
│   │   ├── handler/       # WebSocket endpoint handlers
│   │   ├── controller/    # REST controllers
│   │   ├── config/        # WebSocket routing config
│   │   └── model/         # Data classes
│   └── Dockerfile
└── infra/             # Docker Compose and Makefile
```

## License

MIT
