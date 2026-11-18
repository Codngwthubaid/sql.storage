# SQLVault

Public file submission & admin management platform. Dark, SQL-editor-inspired UI.

## Structure

```
sqlvault/
├── client/   # React + Vite + Tailwind
└── server/   # Express + MongoDB + Cloudinary
```

## Prerequisites

- Node.js 20+
- MongoDB Atlas connection string
- Cloudinary account (cloud name, api key, api secret)

## Backend Setup

```bash
cd server
npm install
cp .env.example .env
# edit .env with your values
npm run dev
```

Server runs on http://localhost:5000. Health check: GET /health.

Initial admin is seeded from `ADMIN_USERNAME` / `ADMIN_PASSWORD` on first boot.

## Frontend Setup

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Frontend runs on http://localhost:5173.

## Environment Variables

### server/.env

```
PORT=5000
NODE_ENV=development
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRES_IN=1d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
MAX_FILES_PER_SUBMISSION=10
STORAGE_PROVIDER=cloudinary   # or local
UPLOAD_DIR=uploads
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### client/.env

```
VITE_API_URL=http://localhost:5000/api
```

## Production Build

```bash
cd client && npm run build
cd server && npm run build && npm start
```

## Deployment

- Frontend: Vercel / Cloudflare Pages (build command `npm run build`, output `dist`).
- Backend: Render / VPS (start `npm start`, set env vars).
- Database: MongoDB Atlas.
- Storage: Cloudinary.

## Security

- JWT in HttpOnly, Secure (prod), SameSite cookie.
- bcrypt password hashing.
- Server-side MIME/signature validation.
- Rate limiting on login/uploads/api.
- Helmet + CORS.
- Authenticated download endpoints.# sql.storage
