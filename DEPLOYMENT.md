# Deployment Guide

This deploys three pieces: MongoDB Atlas (database, cloud-hosted), Render
(backend API), and Vercel (frontend). All have free tiers sufficient for a
student project/demo.

## 1. MongoDB Atlas (do this first — you need the connection string for Render)

1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a free "M0" cluster
3. Under **Database Access**, create a database user (username + password —
   save these, you'll need them in the connection string)
4. Under **Network Access**, add IP `0.0.0.0/0` ("allow access from anywhere")
   — fine for a student project; a production system would restrict this to
   the deploy platform's IP ranges
5. Click **Connect** → **Drivers** → copy the connection string, it looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`
6. Add your database name at the end: `.../mediai-pro?retryWrites=true...`

## 2. Backend on Render

1. Push your code to GitHub first (see GIT_WORKFLOW.md if you haven't)
2. Go to https://render.com → New → Web Service → connect your GitHub repo
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance type**: Free
4. Add environment variables (Render dashboard → Environment tab) — copy every
   key from `server/.env.example`, with real values:
   - `MONGO_URI` → your Atlas connection string from step 1
   - `JWT_SECRET` / `JWT_REFRESH_SECRET` → generate with:
     `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `CLIENT_URL` → your Vercel URL (you'll get this in step 3 — come back and
     update this after deploying the frontend)
   - `NODE_ENV` → `production`
   - `OPENAI_API_KEY`, `EMAIL_*` → optional, app works with mocks if omitted
5. Deploy. Render gives you a URL like `https://mediai-pro-api.onrender.com`
6. Test it: visit `https://your-app.onrender.com/api/health` — you should see
   `{"success":true,"message":"MediAI Pro API is running"}`

**Note on free tier:** Render's free web services spin down after 15 minutes
of inactivity and take ~30-60 seconds to wake up on the next request. This is
normal — don't panic if your first request after idle time is slow.

**Note on file uploads:** Render's free tier filesystem is ephemeral (wiped
on every redeploy/restart). Uploaded lab reports will be lost on redeploy.
For a real deployment, swap `server/middleware/upload.js` to use Cloudinary
(there's a comment block in that file showing exactly how).

## 3. Frontend on Vercel

1. Go to https://vercel.com → Add New → Project → import your GitHub repo
2. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
3. Add environment variable:
   - `VITE_API_URL` → your Render backend URL + `/api`, e.g.
     `https://mediai-pro-api.onrender.com/api`
4. Deploy. Vercel gives you a URL like `https://mediai-pro.vercel.app`
5. **Go back to Render** and update `CLIENT_URL` to this Vercel URL, then
   redeploy the backend (this is required for CORS to allow requests from
   your live frontend — without it, the browser will block API calls)

## 4. Final checks

- Visit your Vercel URL, register a patient account, confirm you land on the dashboard
- Open browser dev tools → Network tab → confirm API calls go to your Render
  URL and return 200s, not CORS errors
- Run `npm run seed` — but note this needs to run against your **production**
  database. Either:
  a) Temporarily set `MONGO_URI` in your local `server/.env` to the Atlas
     connection string and run `npm run seed` locally, or
  b) Add a one-off "Shell" command in Render's dashboard: `npm run seed`

## 5. Custom domain (optional)

Both Vercel and Render support custom domains with free HTTPS. Vercel:
Project Settings → Domains. Render: same, under the service's Settings tab.
