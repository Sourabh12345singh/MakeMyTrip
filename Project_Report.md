# MakeMyTrip Clone - Final Project Report

## Overview
This project is a full-stack, production-ready clone of a modern travel booking platform. I started by building a solid Minimum Viable Product (MVP) and iteratively expanded it by engineering six complex, real-world travel industry features.

## What I Built (Features & Functionality)
1. **The MVP:** Designed a robust core handling user authentication, profile management, and a complete administrative panel for inventory control.
2. **Dynamic Pricing Engine:** Engineered a system that automatically fluctuates flight prices based on simulated demand and time-to-departure, updating clients in real-time via WebSockets.
3. **Interactive Booking Maps:** Built dynamic UI maps allowing users to visually select and save specific airplane seats (Economy/Premium/Business) and hotel room types.
4. **Live Flight Tracking & Push Notifications:** Implemented a background tracker that transitions flight states (Boarding, Delayed, Landed) and uses the Web Push API to alert users instantly.
5. **Automated Cancellation & Refunds:** Created a self-service pipeline where users can cancel bookings and a scheduled backend worker automatically calculates and processes pro-rated refunds.
6. **Community Review System:** Developed a comprehensive platform for users to rate, review, reply, upvote, and flag inappropriate content for moderation.
7. **Personalized Recommendations:** Built a multi-strategy engine (utilizing booking history, budget analysis, and collaborative filtering) to suggest highly relevant flights and hotels to users.

## How I Built It (Tech Stack)
- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, and shadcn/ui.
- **Backend:** Spring Boot (Java 17) featuring REST APIs, WebSocket integrations (STOMP), and `@Scheduled` background workers.
- **Database:** MongoDB for flexible, highly scalable document storage of all user profiles, inventory, bookings, and reviews.

## Deployment Architecture

The application has been successfully deployed to the cloud using modern hosting solutions:

- **Frontend Hosting:** Deployed on **Vercel** for fast, global edge-network delivery.
- **Backend Hosting:** Deployed on **Render** to host the Spring Boot Java server.
- **Database:** Hosted on **MongoDB Atlas** for reliable cloud data storage.

> [!WARNING]
> **Important Note Regarding Initial Load Times (Cold Starts)**
> Because the backend is currently deployed on **Render's Free Tier**, the server automatically spins down (goes to sleep) after 15 minutes of inactivity. 
> 
> **When accessing the application after a period of inactivity, the backend may take up to 2 full minutes to wake up.** Please be patient during the initial load; once the server is awake, the application will respond instantly with low latency.
