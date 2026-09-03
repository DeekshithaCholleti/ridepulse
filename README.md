# RidePulse

## Real-Time Campus Shuttle Tracking and Operations Platform

RidePulse is a campus transportation platform that helps students find shuttles, helps drivers report live operating data, and helps administrators monitor and communicate service changes.

The project currently contains:

- A React and TypeScript frontend for the interactive campus experience.
- An Express and Node.js backend prepared for MongoDB persistence, authentication, REST APIs, and Socket.IO real-time communication.
- A realistic seeded campus dataset and a browser-based GPS simulation for demonstrations and presentations.

> **Current implementation note:** The frontend demo currently uses local seeded data in `src/data/campusData.ts`. Shuttle movement is simulated in the browser and passenger/alert changes are synchronized between open browser tabs with `BroadcastChannel`. The backend is a separate service scaffold with MongoDB models and APIs; the frontend is not yet connected to those APIs by default.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [How the System Works](#how-the-system-works)
- [Application Walkthrough](#application-walkthrough)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Backend API](#backend-api)
- [Data and Real-Time Design](#data-and-real-time-design)
- [Presentation / PPT Outline](#presentation--ppt-outline)
- [Limitations and Next Steps](#limitations-and-next-steps)
- [Troubleshooting](#troubleshooting)

## Problem Statement

Campus shuttle users often do not know:

- Where a shuttle is right now.
- When it will reach the next stop.
- How crowded it is likely to be.
- Whether a delay, route change, or vehicle issue has occurred.

Transport operators and campus administrators also need a simple way to update passenger counts and communicate changes quickly.

## Solution

RidePulse provides a single campus transit view with:

1. A live map of shuttles, routes, stops, and important campus locations.
2. Estimated arrival information based on shuttle position and route progress.
3. Crowd-level visibility based on current passengers and vehicle capacity.
4. Driver controls for passenger counting, delay reporting, and issue reporting.
5. An administrative control panel for fleet monitoring and campus-wide alerts.

## Key Features

### Student experience

- Search for shuttles, routes, and campus locations.
- View shuttles moving on an interactive Leaflet map.
- Inspect a selected shuttle's current stop, next stop, distance, status, occupancy, and ETA.
- View upcoming stops as a route timeline.
- See crowd levels as `LOW`, `MEDIUM`, or `HIGH`.
- Read active service alerts, including delays, route changes, and emergencies.
- Inspect locations such as gates, academic blocks, hostels, facilities, sports areas, parking, and services.

### Driver operations

- Select the assigned shuttle.
- Record how many students boarded and exited.
- Validate passenger counts so they cannot become negative or exceed vehicle capacity.
- Automatically recalculate the crowd level after an update.
- Report a delay with a duration and reason.
- Report a vehicle issue and mark the shuttle as under maintenance.
- See the shuttle's current stop, next stop, status, occupancy, and last update time.

### Administration

- Monitor every shuttle's status, route, driver, passenger count, capacity, and crowd level.
- Pause or resume the GPS simulation.
- Broadcast an alert to all shuttles or target one shuttle.
- Choose alert types: information, delay, route change, or emergency.
- Give campus users immediate visibility of operational changes.

### Demonstration support

- Three seeded shuttles are available: `SH-101`, `SH-102`, and `SH-103`.
- Seeded campus routes and locations make the interface usable without external GPS hardware.
- Multiple browser tabs can demonstrate student, driver, and administrator views at the same time.
- Browser `BroadcastChannel` synchronization makes passenger and alert changes visible across tabs.

## User Roles

| Role | Main responsibility | Important actions |
| --- | --- | --- |
| Student | Plan and monitor a campus journey | Search, inspect map, view ETA, check crowding, read alerts |
| Driver | Update the operating state of a shuttle | Count passengers, report delays, report vehicle issues |
| Administrator | Coordinate the complete fleet | Monitor fleet, pause simulation, broadcast alerts |

The current frontend uses a role selector for demonstration. It is a UI mode switch, not yet a secure login or permission boundary. The backend includes JWT authentication and role middleware for the production direction.

## How the System Works

### Frontend demo flow

1. `ShuttleProvider` loads seeded shuttles, routes, locations, and alerts.
2. A timer updates each active shuttle's progress every second.
3. The shuttle position is interpolated between the current and next route stops.
4. Distance and ETA utilities calculate the selected shuttle's arrival information.
5. Driver actions update passenger totals and derive the crowd level from capacity.
6. Delay and issue reports change shuttle status and create service alerts.
7. `BroadcastChannel` sends passenger and alert changes to other open tabs.

### Intended connected-system flow

1. A driver device or GPS unit sends location and operating updates to the backend.
2. The backend authenticates the user, validates the payload, and stores the latest state in MongoDB.
3. REST endpoints provide current data to the frontend.
4. Socket.IO rooms can distribute updates to clients watching a specific shuttle.
5. Students receive updated locations, ETAs, crowd levels, and alerts without manually refreshing.
6. Administrators use the same data to monitor fleet health and communicate changes.

## Application Walkthrough

### Student dashboard

The default screen combines a search area, interactive campus map, selected-shuttle details, route progress, occupancy information, and operational statistics. Selecting a map marker or search result focuses the relevant shuttle or location.

### Live map

The map is built with React Leaflet. It shows the campus area, route paths, stop markers, location markers, and moving shuttle markers. Selecting a shuttle exposes its current movement and route context.

### Routes view

The routes screen presents the available shuttle routes, their descriptions, colors, stops, and distance information.

### Alerts view

The alerts screen displays active and previously generated service messages. Alerts may be informational, delay-related, route-related, or emergency-related.

### Driver panel

The driver panel is an operational terminal. It protects the passenger count from invalid values, recalculates crowd levels, and provides quick forms for delay and maintenance reports.

### Admin panel

The admin panel combines fleet status monitoring with a broadcast form. An administrator can send a general alert or associate it with a selected shuttle.

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- React Leaflet and Leaflet
- Lucide React icons
- Tailwind CSS 4 with the Vite plugin
- Oxlint
- Browser `BroadcastChannel` for demo synchronization

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- bcryptjs password hashing
- Socket.IO
- CORS
- dotenv
- Nodemon for development

## Project Structure

```text
ridepluse/
├── README.md
├── ridepulse-frontend/
│   ├── src/
│   │   ├── components/       # Student, driver, admin, map, routes, alerts, navbar
│   │   ├── context/          # Shared shuttle state and simulation loop
│   │   ├── data/              # Seeded campus locations, routes, shuttles, alerts
│   │   ├── types/             # TypeScript domain models
│   │   └── utils/             # Distance, ETA, crowd, and geometry helpers
│   ├── package.json
│   └── vite.config.ts
└── ridepulse-backend/
    ├── src/
    │   ├── config/            # Database connection
    │   ├── controllers/       # Request handlers
    │   ├── middleware/        # Auth, roles, and error handling
    │   ├── models/            # MongoDB schemas
    │   ├── routes/            # REST endpoint definitions
    │   ├── services/          # GPS, ETA, and crowd business logic
    │   ├── sockets/           # Socket.IO handlers
    │   ├── utils/             # Token, distance, and seed utilities
    │   └── server.js          # HTTP application entry point
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18 or newer.
- npm.
- MongoDB for running the backend.
- A modern browser for the frontend map and `BroadcastChannel` demo.

### Start the frontend demo

```bash
cd ridepulse-frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

Useful frontend commands:

```bash
npm run build    # TypeScript check and production build
npm run lint     # Oxlint
npm run preview  # Preview the production build
```

### Start the backend

Create `ridepulse-backend/.env` using the example below, then run:

```bash
cd ridepulse-backend
npm install
npm run dev
```

For a normal start without Nodemon:

```bash
npm start
```

The backend defaults to `http://localhost:4000` and exposes a health response at `/`.

## Configuration

Create `ridepulse-backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/ridepulse
JWT_SECRET=replace-with-a-long-random-secret
```

Do not commit real secrets. The backend cannot start successfully until `MONGO_URI` points to a reachable MongoDB instance.

## Backend API

The backend is organized around these route groups:

| Base path | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, and authenticated profile access |
| `/api/shuttles` | Shuttle records and fleet operations |
| `/api/routes` | Route data |
| `/api/location` | Location and GPS data |
| `/api/alerts` | Service alerts |
| `/api/crowd` | Crowd and passenger information |
| `/api/users` | User management |

Authentication endpoints currently include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` with `Authorization: Bearer <token>`

The backend uses JWTs for authentication and includes role-based middleware for protected operations. Check the route and controller files for the exact request and response payloads as the API evolves.

### Socket.IO events

The current Socket.IO server supports shuttle-specific rooms:

- `join-shuttle` with a shuttle ID.
- `leave-shuttle` with a shuttle ID.

A client can join `shuttle:<shuttleId>` to prepare for targeted real-time shuttle updates.

## Data and Real-Time Design

### Crowd calculation

Passenger updates use this invariant:

```text
new passenger count = current count + boarded students - exiting students
```

The update is rejected when the result is below zero or above the shuttle capacity. The resulting occupancy ratio determines the crowd level.

### ETA calculation

The frontend estimates distance using the Haversine formula and derives the ETA from the shuttle's distance and operating speed. Route progress is represented from `0` to `1` between two stops.

### State boundaries

- Frontend demo state: React Context in `ShuttleContext.tsx`.
- Frontend demo persistence: none; refreshing resets seeded state.
- Cross-tab demo updates: browser `BroadcastChannel`.
- Intended backend persistence: MongoDB models and controllers.
- Intended live transport: Socket.IO shuttle rooms and GPS service.

## Presentation / PPT Outline

The following sequence works well for a project presentation:

1. **Title:** RidePulse - Real-Time Campus Shuttle Tracking and Operations Platform.
2. **Problem:** Students lack reliable shuttle visibility; operators lack a shared operational view.
3. **Objectives:** Improve discoverability, ETA awareness, crowd visibility, and incident communication.
4. **Solution overview:** Student dashboard, driver terminal, admin command center, and live map.
5. **Student workflow:** Search a location or shuttle, inspect the map, view next stop, ETA, occupancy, and alerts.
6. **Driver workflow:** Select a shuttle, record boardings/exits, validate capacity, and report delay or maintenance issues.
7. **Admin workflow:** Monitor the fleet, pause/resume simulation, and broadcast targeted or campus-wide alerts.
8. **System architecture:** React frontend, shared state, REST API, MongoDB, JWT, Socket.IO, and Leaflet map.
9. **Real-time logic:** GPS simulation moves between route stops; passenger updates recalculate crowd levels; alerts propagate to open tabs.
10. **Technology choices:** React and TypeScript for maintainability, Leaflet for maps, Express for APIs, MongoDB for flexible transport data, Socket.IO for live updates.
11. **Demo:** Show the student map, switch to driver mode, update passengers, open another tab, and show the alert in admin mode.
12. **Impact:** Less waiting uncertainty, better capacity awareness, faster incident communication, and improved transport coordination.
13. **Future scope:** Connect real GPS hardware, persist frontend actions through the API, add push notifications, and enforce authenticated role-specific access.
14. **Conclusion:** RidePulse turns campus transport from an uncertain wait into a visible, coordinated service.

### Suggested live demonstration

- Start the frontend and open it in two browser tabs.
- Leave one tab in Student mode and switch the other to Driver mode.
- Select `SH-101` and add boarding passengers.
- Show the occupancy and crowd level change in both tabs.
- Report a delay and open Alerts to show the generated alert.
- Switch to Admin mode and broadcast a targeted emergency or route-change alert.
- Pause and resume the GPS simulation to explain the movement loop.

## Limitations and Next Steps

The project is presentation-ready as a functional simulation, but the following work is needed for production deployment:

- Connect frontend data fetching and mutations to the backend API.
- Connect driver GPS devices or a driver mobile client.
- Persist shuttle locations, passenger counts, alerts, and route history in MongoDB.
- Replace the frontend role selector with authenticated login and protected routes.
- Enforce role permissions on every relevant backend endpoint.
- Add Socket.IO client integration for server-originated location and alert updates.
- Add push notifications or email/SMS escalation for critical alerts.
- Add automated unit, integration, and end-to-end tests.
- Add production CORS restrictions, request validation, rate limiting, logging, and monitoring.
- Replace or configure the seeded campus coordinates for the actual institution.

## Troubleshooting

### Backend exits while starting

Check that MongoDB is running and that `MONGO_URI` is present and valid in `ridepulse-backend/.env`. The backend connects to MongoDB before it begins listening.

### Frontend does not start with `npm run dev`

Run `npm install` inside `ridepulse-frontend`, then retry. Also check that the Vite port is not already in use.

### Map tiles do not appear

The map uses Leaflet tiles and requires network access to the configured tile provider. The application data and markers can still be inspected when tile loading is unavailable.

### Changes disappear after refresh

This is expected in the current demo. Frontend state is held in memory. Connect the UI to the backend persistence layer when durable state is required.

## License

No license has been defined for this project yet.
