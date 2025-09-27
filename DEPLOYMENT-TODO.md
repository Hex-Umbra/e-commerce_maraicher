Deployment and Environment TODO (Monorepo: Vercel Frontend, Render Backend)

Overview
- Frontend (Vite/React) uses env:
  - VITE_API_URL (required)
  - VITE_NODE_ENV (optional; Vite provides import.meta.env.DEV/PROD)
- Backend (Express/Mongoose/JWT) uses env:
  - PORT (Render provides at runtime)
  - NODE_ENV ("production" in prod; code treats "dev" specially)
  - MONGO_URI (required)
  - JWT_SECRET (required)
  - JWT_EXPIRATION (recommended, e.g., "7d")
  - JWT_ISSUER (optional)
  - JWT_AUDIENCE (optional)
  - JWT_ALGORITHM (optional; default HS256)
  - JWT_COOKIE_EXPIRES_IN (optional, ms; default 7 days)
- Current constraints to fix before cross-site auth works:
  - CORS origins are hardcoded to localhost in backend/server.js
  - Cookies are set with SameSite: "Strict" (blocks cross-site on Vercel ⇄ Render)

Action Items (Backlog Checklist)
- [ ] Backend: Make CORS origins configurable via env (CORS_ORIGINS)
  - File: backend/server.js
  - Replace hardcoded origin list with reading CORS_ORIGINS (comma-separated list). Include credentials: true, expose set-cookie header.
- [ ] Backend: Make auth cookie flags configurable via env
  - File: backend/controllers/authController.js
  - Use COOKIE_SAMESITE and COOKIE_SECURE (default to None/true in production) where cookieOptions is defined (login) and in logout.
- [ ] Backend: Add trust proxy in production
  - File: backend/server.js
  - app.set("trust proxy", 1) when NODE_ENV=production to play nice with proxies/secure cookies.
- [ ] Backend: Production start command
  - Render Start Command: node server.js (do NOT use nodemon)
  - Optional: change "start" in backend/package.json to "node server.js"
- [ ] Frontend: Set Vercel env
  - VITE_API_URL=https://your-backend.onrender.com/api
- [ ] Create example env files (not committed)
  - [ ] backend/.env.example
  - [ ] frontend/.env.example
- [ ] README: Document deployment steps and env variables for Vercel and Render
- [ ] Post-deploy verification checklist (CORS, cookies, endpoints)

Backend Environment Variables (Render)
Required
- MONGO_URI: MongoDB connection string
  Example: mongodb+srv://user:pass@cluster/dbname?retryWrites=true&amp;w=majority
- JWT_SECRET: Strong secret for JWT signing (32+ chars)
  Example: use openssl rand -base64 32 to generate
- NODE_ENV: production

Recommended
- PORT: (Render sets automatically; code uses process.env.PORT)
- JWT_EXPIRATION: 7d
- JWT_ISSUER: yourapp (or your domain)
- JWT_AUDIENCE: yourapp-users
- JWT_ALGORITHM: HS256
- JWT_COOKIE_EXPIRES_IN: 604800000 (7 days in ms)
- CORS_ORIGINS: Comma-separated allowed origins (exact Vercel domain(s))
  Example: https://yourapp.vercel.app,https://yourapp-git-main-username.vercel.app
- COOKIE_SAMESITE: None
- COOKIE_SECURE: true

Frontend Environment Variables (Vercel)
Required
- VITE_API_URL: Base API URL with /api suffix from Render
  Example: https://your-backend.onrender.com/api

Optional
- VITE_NODE_ENV: production (optional; Vite already exposes import.meta.env.PROD)

Code Changes (Recommended)
1) backend/server.js
- Parse CORS_ORIGINS and configure dynamic CORS:
  - const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean)
  - app.use(cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true)
        if (allowedOrigins.includes(origin)) return cb(null, true)
        return cb(new Error("Not allowed by CORS"))
      },
      credentials: true,
      methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
      allowedHeaders: ["Content-Type","Authorization","Cookie"],
      exposedHeaders: ["set-cookie"]
    }))
- When production:
  - app.set("trust proxy", 1)

2) backend/controllers/authController.js
- Cookie flags (both in login/createSendToken and logout):
  - secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production"
  - sameSite: process.env.COOKIE_SAMESITE || "None"
  - maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7 * 24 * 60 * 60 * 1000

3) backend/package.json (optional)
- Set "start": "node server.js", or configure Render Start Command to "node server.js"

Deployment Steps: Backend on Render (Web Service)
1) Create a new Web Service on Render, root directory: backend
2) Runtime: Node
   - Build Command: npm install (default)
   - Start Command: node server.js
3) Set Environment Variables:
   - Required: MONGO_URI, JWT_SECRET, NODE_ENV=production
   - Recommended: JWT_EXPIRATION, JWT_ISSUER, JWT_AUDIENCE, JWT_ALGORITHM, JWT_COOKIE_EXPIRES_IN
   - CORS_ORIGINS: Vercel domain(s), comma-separated (no wildcards with credentials)
   - COOKIE_SAMESITE=None, COOKIE_SECURE=true
4) Deploy and note the service URL, e.g., https://your-backend.onrender.com
5) Post-deploy quick tests (HTTPS only):
   - GET https://your-backend.onrender.com/api/products
   - From browser console on your Vercel domain, make a fetch with credentials:
     fetch("https://your-backend.onrender.com/api/products", { credentials: "include" })
   - Verify response CORS headers reflect your Vercel origin and Access-Control-Allow-Credentials: true

Deployment Steps: Frontend on Vercel (Vite/React)
1) Create Vercel Project from the repo with root path: frontend
2) Framework Preset: Vite
3) Build Command: npm run build
4) Output Directory: dist
5) Environment Variables:
   - Production: VITE_API_URL=https://your-backend.onrender.com/api
   - Preview: same or use a separate Render preview URL
6) Deploy and test API calls from the Vercel domain

Cross-site Auth and CORS Checklist
- [ ] Backend CORS origin function allows EXACT Vercel origin(s)
- [ ] Backend CORS sets credentials: true
- [ ] Backend cookie options: SameSite=None and Secure=true in production
- [ ] HTTPS used end-to-end (Vercel and Render are HTTPS by default)
- [ ] Axios instance uses withCredentials: true (already enabled)
- [ ] Test login flow: cookie set on response, subsequent authenticated requests include cookie

Example .env files (Do Not Commit)
backend/.env.example
- NODE_ENV=production
- PORT=5000
- MONGO_URI=mongodb+srv://user:pass@cluster/dbname?retryWrites=true&amp;w=majority
- JWT_SECRET=REPLACE_WITH_STRONG_SECRET
- JWT_EXPIRATION=7d
- JWT_ISSUER=yourapp
- JWT_AUDIENCE=yourapp-users
- JWT_ALGORITHM=HS256
- JWT_COOKIE_EXPIRES_IN=604800000
- CORS_ORIGINS=https://yourapp.vercel.app,https://yourapp-git-main-username.vercel.app
- COOKIE_SAMESITE=None
- COOKIE_SECURE=true

frontend/.env.example
- VITE_API_URL=https://your-backend.onrender.com/api
- VITE_NODE_ENV=production

Security and Secrets
- Never commit real .env files (repo ignores **/.env)
- Use Render and Vercel dashboards to store secrets
- Rotate JWT_SECRET if compromised; invalidate tokens if needed

Known Pitfalls
- Wildcard origins with credentials are not allowed for CORS; enumerate exact domains
- SameSite=Strict blocks cross-site cookie usage; use None with Secure in production
- Ensure Start Command on Render uses node (not nodemon)
- If cookies still don’t appear, confirm trust proxy setting and that Set-Cookie includes SameSite=None; Secure; Path=/; HttpOnly

Verification Before Go-Live
- [ ] MONGO_URI connects; backend logs show MongoDB connected
- [ ] GET /api/products works from Vercel domain
- [ ] Login works from Vercel; browser shows a cookie named "jwt" for backend domain
- [ ] Authenticated endpoints (e.g., /api/cart) succeed from Vercel
- [ ] No CORS errors in browser console
- [ ] Error responses are generic in production (NODE_ENV=production)

Optional Improvements (Future)
- [ ] Add engines.node in backend/package.json to pin Node version on Render
- [ ] Add health check route (e.g., GET /api/health)
- [ ] Add rate limit configs to env
- [ ] Add staging Render service and Vercel preview envs

Quick Commands (Local)
- Generate a JWT secret: openssl rand -base64 32
- Test env locally:
  - Backend: cp backend/.env.example backend/.env and update values
  - Frontend: cp frontend/.env.example frontend/.env.local and update values

End of file.
