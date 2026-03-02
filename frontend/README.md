# Frontend (React + Vite)

Minimal production-style UI for the SecureUser Auth API.

## Run

```bash
cd frontend
npm install
npm run dev
```

## Folder structure

```text
frontend/
├── src/
│   ├── api/              # Axios clients + auth endpoints
│   ├── auth/             # Auth provider/context + token storage
│   ├── components/       # Route guards and shared components
│   ├── layouts/          # Auth page layout
│   ├── pages/            # Login, Register, Dashboard
│   ├── router/           # App routes
│   └── styles/           # Global styling
```

## Token strategy

- Access token is held only in React state (memory).
- Refresh token is kept in localStorage (`secureuser_refresh_token`).
- On app startup, refresh token is exchanged for a new access token.
- Axios response interceptor catches `401` responses and calls `/auth/refresh`.
- Failed refresh clears session and redirects to login through protected route.

## Routes

- `/login`
- `/register`
- `/dashboard` (protected)

Dashboard fetches `/users` only when role is `admin`.
