# NexusMeet - Video Conferencing Application

NexusMeet is a modern, open-source video conferencing application built with React, NestJS, and WebRTC. It leverages modern web technologies to provide a smooth real-time communication experience.

## Tech Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS**
- **RxJS**
- **Livekit**
- **Storybook**
- **Framer Motion**
- **IndexedDB**

### Backend
- **NestJS**
- **Livekit**
- **Swagger**
- **SQLite**
- **Prisma**

## Live Demo
- **Live Site**: [nexus-meet.vercel.app](https://nexus-meet.vercel.app/signin)
- **Storybook**: [Chromatic Deployment](https://67b58226c871a884bc89a90b-oyibqdsbtl.chromatic.com)
- **Swagger API Docs**: [nexusmeet.onrender.com/api](https://nexusmeet.onrender.com/api)

## Repository
- **GitHub**: [somya339/Team-Conference](https://github.com/somya339/Team-Conference)

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed:
- **Node.js** (LTS recommended)
- **pnpm** (package manager)
- **LiveKit local server** [Refer to docs](https://docs.livekit.io/home/self-hosting/local/)

### Local Setup

Clone the repository:
```sh
git clone https://github.com/somya339/Team-Conference.git
cd Team-Conference
```

Install dependencies:
```sh
pnpm --filter nexusmeet-web install
```

### Configure Environment Variables

#### Backend (`apps/server/.env`)
```sh
JWT_SECRET=<jwt-secret>
FRONTEND_URL=http://localhost:5173
LIVEKIT_API_KEY=devkey
LIVEKIT_SECRET=secret
```

#### Frontend (`apps/web/.env`)
```sh
VITE_SERVER_URL=<backend-url>
VITE_LIVEKIT_URL=<your-livekit-ws-url>
```

### Start the Development Servers
Run both frontend and backend in parallel:
```sh
pnpm --filter nexusmeet-web dev
pnpm --filter nexusmeet-server start:dev
```

The frontend should now be running at `http://localhost:5173/` and the backend will be running at `http://localhost:3000/`.

---

## 🛠 Testing with Storybook/Chromatic

### Running Storybook Locally
```sh
pnpm storybook
```
Storybook will start on `http://localhost:6006/`.

### Deploying to Chromatic
Ensure you have a [Chromatic](https://www.chromatic.com/) account set up.

1. Install Chromatic CLI if not already installed:
   ```sh
   pnpm add -D chromatic
   ```
2. Run Chromatic deployment:
   ```sh
   pnpm chromatic --project-token=<your-chromatic-project-token>
   ```

This will upload your Storybook to Chromatic for visual testing.

---

## 📜 License
NexusMeet is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 🤝 Contributing
Pull requests are welcome! Please follow best practices and ensure any changes do not break existing functionality.

---

## 📧 Contact
For inquiries or support, reach out to [@ore-codes](https://github.com/ore-codes) on GitHub.

---

## Development Notes

### Architecture Decisions
- Using monorepo structure with Turbo for better code sharing
- LiveKit for real-time video/audio communication
- Prisma for type-safe database operations
- Storybook for component development and testing

### Performance Optimizations
- Lazy loading for meeting components
- IndexedDB for local storage
- RxJS for reactive state management

### Recent Development History
NexusMeet is developed by [Your Name]. Focus on:
- **Enhanced UI/UX**: Modern design system with Tailwind CSS and custom animations
- **Better Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Performance Improvements**: Code splitting, lazy loading, and optimized builds
- **Security Enhancements**: JWT token refresh, input validation, and secure authentication
- **Developer Experience**: Enhanced tooling, better TypeScript support, and comprehensive documentation

### Key Features Implemented
- ✅ Modern authentication system with JWT refresh
- ✅ Real-time video conferencing with LiveKit
- ✅ Responsive dashboard with meeting management
- ✅ File upload and submission system
- ✅ Comprehensive error handling and validation
- ✅ Performance optimizations and caching
- ✅ Modern UI components with accessibility support
- ✅ API documentation with Swagger
- ✅ Development and production configurations

Enjoy building with **NexusMeet**! 🚀

