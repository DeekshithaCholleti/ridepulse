# RidePulse Backend

The backend service for the RidePulse campus shuttle tracking platform is documented in the [project README](../README.md).

## Quick Start

Create `ridepulse-backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/ridepulse
JWT_SECRET=replace-with-a-long-random-secret
```

Then run:

```bash
npm install
npm run dev
```

The service starts at `http://localhost:4000` after it connects to MongoDB. The root health check is `GET /`.

## Service Responsibilities

- JWT authentication and role-aware access control.
- MongoDB models for users, shuttles, routes, locations, and alerts.
- REST API route groups for authentication, fleet data, routes, locations, alerts, crowd data, and users.
- GPS, ETA, crowd-level, and distance service utilities.
- Socket.IO shuttle rooms for targeted real-time updates.
- Centralized not-found and error handling.

For the complete feature list, architecture, endpoint overview, frontend setup, demo workflow, PPT outline, and production roadmap, see the [project README](../README.md).

## Structure

- `src/config`: Database and application configuration
- `src/controllers`: Request handlers
- `src/models`: MongoDB models
- `src/routes`: API route definitions
- `src/middleware`: Authentication, authorization, and error handling
- `src/services`: ETA, GPS, and crowd-level business logic
- `src/utils`: Shared utilities
- `src/sockets`: Socket.IO event handlers
- `src/server.js`: Application entry point
