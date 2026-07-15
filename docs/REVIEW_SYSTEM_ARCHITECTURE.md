# Review & Rating System — Architecture Documentation

## System Overview

The MakeMyTrip Review & Rating System allows users to rate hotels and flights on a 1–5 star scale, write detailed text reviews, upload photos, reply to reviews, vote on helpfulness, and flag inappropriate content for admin moderation.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js + TypeScript)                    │
│                                                                             │
│  ┌──────────┐  ┌──────────┐                                                │
│  │flight.tsx │  │hotel.tsx │    ← Pages that integrate ReviewSection        │
│  └────┬─────┘  └────┬─────┘                                                │
│       │              │                                                      │
│       └──────┬───────┘                                                      │
│              ▼                                                              │
│  ┌───────────────────┐      ┌────────────────┐                             │
│  │  ReviewSection.tsx │──────│  ReviewForm.tsx │  ← Write new reviews       │
│  └────────┬──────────┘      └────────────────┘                             │
│           │                                                                 │
│           ▼                                                                 │
│  ┌────────────────┐   ┌───────────────────┐   ┌──────────────┐            │
│  │ ReviewCard.tsx  │───│ReviewFlagDialog.tsx│   │StarRating.tsx│            │
│  │ (vote/reply/    │   │ (flag content)     │   │ (1-5 stars)  │            │
│  │  edit/delete)   │   └───────────────────┘   └──────────────┘            │
│  └────────┬────────┘                                                       │
│           │                                                                 │
│           ▼                                                                 │
│  ┌─────────────────────┐         ┌──────────────────┐                      │
│  │ services/reviews.ts │         │ admin.tsx         │                      │
│  │ (API client layer)  │         │ (Moderation Tab)  │                      │
│  └────────┬────────────┘         └────────┬─────────┘                      │
│           │                               │                                 │
│           └───────────┬───────────────────┘                                │
│                       ▼                                                     │
│              ┌──────────────┐                                              │
│              │ lib/axios.ts │  ← HTTP client (base URL config)             │
│              └──────┬───────┘                                              │
└─────────────────────┼──────────────────────────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot 4.1 + Java)                         │
│                                                                             │
│  ┌────────────────────────────────────────────────────┐                    │
│  │              ReviewController.java                  │                    │
│  │  POST   /api/reviews/               (create)       │                    │
│  │  GET    /api/reviews/{type}/{id}    (list+sort)    │                    │
│  │  GET    /api/reviews/{id}           (single)       │                    │
│  │  PUT    /api/reviews/{id}           (update)       │                    │
│  │  DELETE /api/reviews/{id}           (delete)       │                    │
│  │  POST   /api/reviews/{id}/replies   (reply)        │                    │
│  │  GET    /api/reviews/{id}/replies   (get replies)  │                    │
│  │  POST   /api/reviews/{id}/votes     (vote)         │                    │
│  │  POST   /api/reviews/{id}/flags     (flag)         │                    │
│  │  GET    /api/reviews/flags/pending  (moderation)   │                    │
│  │  PUT    /api/reviews/flags/{id}/resolve (resolve)  │                    │
│  └───────────────────┬────────────────────────────────┘                    │
│                      │                                                      │
│                      ▼                                                      │
│  ┌────────────────────────────────────────────────────┐                    │
│  │              ReviewService.java                     │                    │
│  │  - createReview()     - getReviewById()            │                    │
│  │  - updateReview()     - getReviewsByEntityIdSorted()│                    │
│  │  - addReply()         - getRepliesByReviewId()     │                    │
│  │  - flagReview()       - getPendingFlags()          │                    │
│  │  - resolveFlag()      - voteOnReview()             │                    │
│  │  - deleteReviewAndReplies()                        │                    │
│  └───────────────────┬────────────────────────────────┘                    │
│                      │                                                      │
│         ┌────────────┼─────────────┬──────────────┐                        │
│         ▼            ▼             ▼              ▼                         │
│  ┌────────────┐┌───────────┐┌───────────┐┌────────────┐                   │
│  │ReviewRepo  ││ReplyRepo  ││VoteRepo   ││FlagRepo    │                   │
│  └─────┬──────┘└─────┬─────┘└─────┬─────┘└─────┬──────┘                   │
│        │             │            │             │                           │
└────────┼─────────────┼────────────┼─────────────┼──────────────────────────┘
         │             │            │             │
         ▼             ▼            ▼             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MongoDB (Collections)                                 │
│                                                                             │
│  ┌──────────┐  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ reviews  │  │review_replies │  │ review_votes  │  │ review_flags │     │
│  └──────────┘  └───────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Model (Entity Relationships)

```
┌──────────────────────────────────────────────────────────────┐
│                         REVIEW                                │
│  _id            : String (MongoDB ObjectId)                   │
│  entityType     : String ("Flight" | "Hotel")                 │
│  entityId       : String (FK → Flight._id or Hotel._id)      │
│  userEmail      : String                                      │
│  userName       : String                                      │
│  rating         : int (1–5)                                   │
│  title          : String                                      │
│  description    : String                                      │
│  imageUrls      : List<String>                                │
│  helpfulCount   : int                                         │
│  createdAt      : String (ISO DateTime)                       │
│  updatedAt      : String (ISO DateTime)                       │
├──────────────────────────────────────────────────────────────┤
│  Has Many → ReviewReply, ReviewVote, ReviewFlag               │
└──────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌────────────────┐  ┌─────────────────┐
│  REVIEW_REPLY   │  │  REVIEW_VOTE   │  │  REVIEW_FLAG    │
│  _id            │  │  _id           │  │  _id            │
│  reviewId (FK)  │  │  reviewId (FK) │  │  reviewId (FK)  │
│  userEmail      │  │  userEmail     │  │  flaggedByEmail │
│  userName       │  │  type:         │  │  reason         │
│  text           │  │   HELPFUL |    │  │  status:        │
│  createdAt      │  │   NOT_HELPFUL  │  │   PENDING |     │
└─────────────────┘  │  createdAt     │  │   RESOLVED |    │
                     └────────────────┘  │   DISMISSED     │
                     Unique: reviewId    │  createdAt      │
                            + userEmail  └─────────────────┘
```

---

## API Flow: Review Lifecycle

```
USER FLOW                    API CALLS                          DATABASE
─────────                    ─────────                          ────────

1. User views                GET /api/reviews/Flight/{id}       → Query reviews
   flight/hotel              ?sortBy=newest                       collection
   reviews page
                                    │
                                    ▼
2. User writes      ──→     POST /api/reviews/                  → Insert into
   a review with            (multipart: rating, title,            reviews
   stars + text              description, images)                  collection
   + photos
                                    │
                                    ▼
3. Other users      ──→     POST /api/reviews/{id}/replies      → Insert into
   reply to review          (userEmail, userName, text)            review_replies
                                                                   collection
                                    │
                                    ▼
4. Users vote       ──→     POST /api/reviews/{id}/votes        → Insert into
   helpful/not              (userEmail, type)                      review_votes
                            + Update helpfulCount                  collection
                                    │
                                    ▼
5. User flags       ──→     POST /api/reviews/{id}/flags        → Insert into
   inappropriate            (flaggedByEmail, reason)               review_flags
   review                   status = PENDING                       collection
                                    │
                                    ▼
6. Admin reviews    ──→     GET /api/reviews/flags/pending       → Query reviews
   flagged content                                                  with pending
                                                                    flags
                                    │
                                    ▼
7. Admin resolves   ──→     PUT /api/reviews/flags/{id}/resolve
   flag                     action = RESOLVE → keep review
                            action = REMOVE  → delete review
                                              + replies + votes
```

---

## Sorting & Filtering Options

| Sort Option      | Backend Method                                          | Description              |
|------------------|---------------------------------------------------------|--------------------------|
| `newest`         | `findByEntityTypeAndEntityIdOrderByCreatedAtDesc()`     | Most recent first        |
| `most_helpful`   | `findByEntityTypeAndEntityIdOrderByHelpfulCountDesc()`  | Most helpful votes first |
| `highest_rated`  | `findByEntityTypeAndEntityIdOrderByRatingDesc()`        | 5-star first             |
| `lowest_rated`   | `findByEntityTypeAndEntityIdOrderByRatingAsc()`         | 1-star first             |

---

## Technology Stack

| Component        | Technology               |
|------------------|--------------------------|
| Frontend         | Next.js 16 + TypeScript  |
| UI Components    | shadcn/ui + Tailwind CSS |
| HTTP Client      | Axios                    |
| Backend          | Spring Boot 4.1.0        |
| Database         | MongoDB Atlas            |
| File Storage     | Local filesystem uploads |
| Authentication   | Custom (BCrypt passwords)|
| Deployment       | Vercel (FE) + Render (BE)|
