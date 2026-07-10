# Live Flight Status — Data Flow Diagram

```mermaid
flowchart TB
    subgraph Client["Frontend (Next.js)"]
        UI["FlightStatusDashboard<br/>FlightTrackingCard<br/>Flight page"]
        WS_HOOK["useFlightTracking hook<br/>(STOMP WebSocket Client)"]
        SW["Service Worker<br/>(sw.js)"]
        SONNER["sonner Toaster<br/>(in-app notifications)"]
    end

    subgraph Server["Backend (Spring Boot)"]
        CTRL["FlightStatusController<br/>REST: track/untrack/status"]
        MOCK["MockFlightStatusService<br/>@Scheduled(fixedRate=30s)"]
        WS_BROKER["STOMP Message Broker<br/>/topic/flight/{id}"]
        PUSH_SVC["PushNotificationService"]
    end

    subgraph DB["MongoDB"]
        FS[(FlightStatus)]
        TF[(TrackedFlight)]
        PS[(PushSubscription)]
        F[(Flight)]
    end

    %% User Interaction Flow
    UI -->|"POST /api/flights/track"| CTRL
    CTRL -->|"save tracking"| TF
    UI -->|"DELETE /api/flights/tracked/{id}"| CTRL
    CTRL -->|"remove tracking"| TF
    UI -->|"GET /api/flights/tracked?email="| CTRL
    CTRL -->|"query"| TF
    CTRL -->|"get latest status"| FS

    %% Mock Update Flow (every 30s)
    MOCK -->|"read tracked flights"| TF
    MOCK -->|"read flight details"| F
    MOCK -->|"generate & persist mock status"| FS
    MOCK -->|"publish to broker"| WS_BROKER

    %% WebSocket push to frontend
    WS_BROKER -->|"STOMP /topic/flight/{id}"| WS_HOOK
    WS_HOOK -->|"update component state"| UI
    WS_HOOK -->|"trigger toast on change"| SONNER

    %% Push Notification Flow
    MOCK -->|"notify on delay/boarding/cancellation"| PUSH_SVC
    PUSH_SVC -->|"lookup subscriptions for flight"| PS
    PUSH_SVC -->|"Web Push API"| SW
    SW -->|"show system notification"| Client

    %% Subscription Registration
    UI -->|"POST /api/push/subscribe"| CTRL
    CTRL -->|"save push subscription"| PS

    style UI fill:#4a90d9,color:#fff
    style MOCK fill:#e67e22,color:#fff
    style WS_BROKER fill:#2ecc71,color:#fff
    style SW fill:#9b59b6,color:#fff
    style SONNER fill:#f1c40f,color:#222
```

## Flow Steps

| Step | Component | Action | Destination |
|------|-----------|--------|-------------|
| 1 | User clicks "Track Flight" | `POST /api/flights/track` | → `TrackedFlight` collection |
| 2 | `MockFlightStatusService` (every 30s) | Iterates tracked flights, random status update | → `FlightStatus` doc + STOMP broker |
| 3 | STOMP Broker | Pushes to `/topic/flight/{flightId}` | → Frontend WebSocket hook |
| 4 | `useFlightTracking` hook | Parses message, updates React state | → `FlightTrackingCard` re-render |
| 5 | Hook detects status change | Calls `sonner.toast()` | → In-app notification |
| 6 | `MockFlightStatusService` (critical changes) | Triggers `PushNotificationService` | → Web Push API → Service Worker |
| 7 | Service Worker | Displays system notification | → OS notification tray |
| 8 | User clicks "Untrack" | `DELETE /api/flights/tracked/{id}` | → Removed from `TrackedFlight` |

## Status Values

| Status | Meaning | Color |
|--------|---------|-------|
| `ON_TIME` | Operating as scheduled | Green |
| `DELAYED` | Delayed (reason + revised time shown) | Red |
| `BOARDING` | Boarding in progress | Blue |
| `DEPARTED` | Flight has departed | Purple |
| `LANDED` | Flight has arrived | Green |
| `CANCELLED` | Flight cancelled (reason shown) | Red |

## Delay Reasons (Mock Pool)

- Weather conditions at origin/destination
- Technical maintenance
- Air traffic congestion
- Late arrival of incoming aircraft
- Crew scheduling
- Security checks
- Operational requirements
