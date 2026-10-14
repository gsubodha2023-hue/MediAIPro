# MediAI Pro — AI-Powered Smart Healthcare Platform

MediAI Pro is a full-stack MERN healthcare application with role-based patient, doctor, reception, administrator and super-administrator experiences. The UI follows the Premium Clinical Clarity system: navy and teal, accessible typography, consistent icons and relevant clinical photography.

> Educational software: AI output is general guidance, not a diagnosis. This project is not a certified medical device and must undergo privacy, security, clinical and legal review before real patient use.

## Working feature set

- Secure JWT access tokens, HTTP-only refresh cookie, bcrypt passwords and RBAC
- Patient registration/login, password reset adapter, profile, emergency contact and 2FA setting
- AI health chat, symptom urgency checker and deterministic emergency warning layer
- Doctor discovery, appointment booking, status management and notifications
- Medical history and controlled PDF/image report upload
- Health diary; blood pressure, glucose, BMI, weight, water, sleep, mood and vaccination logs
- Medication reminders and doctor-issued digital prescriptions
- Doctor clinical workspace for prescriptions, summaries, schedule and video-provider hand-off
- Reception patient registration, schedule, check-in queue and billing
- Admin user management, hospitals, analytics, payments, content workspace and audit view
- Responsive dark mode, protected routes, 404 and unauthorized screens
- Helmet, CORS, auth rate limiting, validation, file restrictions and central error handling
- OpenAPI starter documentation in `server/docs/openapi.yaml`

External services use safe development fallbacks or adapters. Production AI, SMTP email, Cloudinary, video consultations and online payment capture require provider accounts and environment keys.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB Community Server or MongoDB Atlas

## Run locally

### 1. Configure and start the API

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

Edit `server/.env` before seeding. At minimum set:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mediai_pro
JWT_SECRET=replace_with_a_long_random_secret
JWT_REFRESH_SECRET=replace_with_another_long_random_secret
CLIENT_URL=http://localhost:5173
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Confirm the API at `http://localhost:5000/api/health`.

### 2. Start the frontend

Open a second terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

### 3. Demo accounts

`npm run seed` creates the super-admin account documented by the seed command. Change its password immediately outside a local demo. From the admin dashboard, create doctor and receptionist accounts. Patients self-register from `/register`.

## Main routes

| Role | Pages |
|---|---|
| Public | `/`, `/about`, `/doctors`, `/login`, `/register` |
| Patient | `/patient/dashboard`, `/patient/ai-assistant`, `/patient/book`, `/patient/appointments`, `/patient/records`, `/patient/care`, `/patient/notifications`, `/patient/profile` |
| Doctor | `/doctor/dashboard`, `/doctor/clinical`, `/doctor/records/new` |
| Reception | `/reception/dashboard`, `/reception/operations` |
| Admin | `/admin/dashboard`, `/admin/operations` |

## Quality checks

```bash
cd client
npm run lint
npm test
npm run build

cd ../server
npm test
```

Backend integration tests use `mongodb-memory-server`. On the first run it may need to download a MongoDB test binary; a restricted or offline network can cause that step to wait.

## Production integrations

Add credentials only to local/deployment environment variables—never commit `.env`.

- AI: `OPENAI_API_KEY` (or adapt `server/services/aiService.js` for Gemini)
- Email: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- Uploads: connect Cloudinary in the upload service before multi-instance deployment
- Video: connect your approved provider through `VIDEO_PROVIDER_URL`
- Payments: add a payment gateway server SDK and verified webhook before accepting cards

See `SETUP_GUIDE.md`, `DEPLOYMENT.md`, `GIT_WORKFLOW.md`, and `server/docs/openapi.yaml` for the longer operational guides.

## Architecture

```text
client/src/
  assets/ components/ hooks/ pages/ redux/ routes/ services/ utils/
server/
  config/ controllers/ docs/ middleware/ models/ repositories/
  routes/ services/ tests/ uploads/ utils/ validators/
```

The frontend talks to the Express REST API through one Axios client with automatic token refresh. Express enforces authentication and role permissions before accessing Mongoose models. MongoDB stores clinical and operational records. Optional providers are isolated behind services so local development remains runnable.
