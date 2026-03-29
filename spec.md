# GCG Student Portal

## Current State
New project. Empty Motoko backend and no frontend pages yet.

## Requested Changes (Diff)

### Add
- Authentication: Email/password login & register with ICP-based auth (no Firebase; platform uses Internet Computer backend)
- Session persistence (auto-login via stored identity)
- Protected routes; logout system
- Dashboard: student overview with subjects, upcoming exams, performance stats, alerts/notifications
- Subjects page: cards with subject name, professor, exam date, attendance %, marks, progress bar; View Details + Mark Complete buttons
- Subject Detail: full info, assignments section, attendance and performance charts
- Calendar: interactive calendar with exam/assignment events highlighted; event popup on click
- Profile page: student info (name, course, year, student ID), edit profile, avatar upload (blob-storage)
- Chat system: real-time one-to-one messaging via ICP backend polling, online/offline status, message timestamps, WhatsApp-style UI
- Notification system: real-time toast alerts for assignments/exams
- Search & filter on subjects page
- Performance analytics charts (bar/line charts)
- Sidebar navigation (collapsible, mobile-friendly)
- Dark/Light mode toggle
- Offline detection banner
- Skeleton loaders on all async actions
- Contact/About page: contact form, college info, mission, stats

### Modify
- Backend actor to expose all required APIs

### Remove
- Nothing (new project)

## Implementation Plan
1. Motoko backend: user registration/login, student profile CRUD, subjects data, assignments, messages/chat, notifications
2. Select `authorization` and `blob-storage` components
3. Frontend: React + Tailwind with glassmorphism dark-to-cyan theme, 3D animated background (Three.js particles), collapsible sidebar, all pages listed above
4. Auth flow with protected routes
5. Charts using recharts
6. Real-time chat via polling (1-2s interval)
7. Calendar with react-calendar or custom implementation
8. Dark/light mode via Tailwind class strategy
9. Skeleton loaders, toast notifications, offline detection
