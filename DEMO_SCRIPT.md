# Demo Script — MediAI Pro

A suggested order to click through everything live, e.g. for a viva or module demo.
Total time: ~10-12 minutes if you talk through each step.

## 0. Before you start (setup — do this once)

**Terminal 1 — backend:**
```bash
cd server
npm install
cp .env.example .env
```
Edit `server/.env`:
- `MONGO_URI` → paste your MongoDB Atlas connection string
- `JWT_SECRET` and `JWT_REFRESH_SECRET` → generate two different random strings:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  (run it twice, once for each)
- Leave `OPENAI_API_KEY` and `EMAIL_*` blank — the app runs fine on mocks

Then:
```bash
npm run dev
```
You should see:
```
Server running in development mode on port 5000
MongoDB Connected: cluster0-xxxxx.mongodb.net
```
If you see a MongoDB connection error instead, double-check your Atlas
connection string, database user password, and that you allowed `0.0.0.0/0`
under Atlas → Network Access.

**Terminal 2 — frontend:**
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
You should see a `Local: http://localhost:5173/` URL. Open it in your browser.

**One-time: create your first admin account:**
```bash
cd server
npm run seed
```
This prints an email/password (`admin@mediaipro.test` / `ChangeMe123`) — you'll use it in Act 3 below.

---

## Act 1 — Landing page & patient signup (~2 min)

1. Open `http://localhost:5173` → point out the landing page, hero image, feature cards
2. Click the sun/moon icon top-right → show dark mode toggling, mention it persists on reload
3. Click **Get started** → fill in the register form → submit
4. You land on the **Patient Dashboard** — point out the three quick-link cards

## Act 2 — Booking as a patient, before any doctor exists (~1 min)

1. Click **Book appointment** → the doctor list is empty, with a message explaining
   an admin needs to create doctor accounts first
2. This is a good moment to explain the deliberate design: patients can't
   self-elevate to `doctor` role — only an admin can create staff accounts

## Act 3 — Admin creates a doctor (~2 min)

1. Open a new incognito/private window (so you don't lose your patient session)
2. Go to `/login`, sign in as `admin@mediaipro.test` / `ChangeMe123`
3. Lands on **Admin Dashboard** → fill in "Create staff account":
   role = Doctor, name = "Dr. Alice Perera", email, password,
   specialization = "Cardiology", license number = "SLMC-12345"
4. Point out the new doctor appears in the "All users" list below

## Act 4 — Full booking + confirmation loop (~3 min)

1. Back in your patient window → refresh **Book appointment** → the doctor
   now appears as a card with an avatar → select them, pick a date/time, submit
2. Open a third window, log in as the doctor you just created
3. On the **Doctor Dashboard**, show the pending appointment request
   → click **Confirm**
4. Point out the notification bell (top-right) → click it → show "Appointment confirmed"
5. Switch back to the patient window → refresh **My appointments** → status is now "confirmed"

## Act 5 — Medical records (~1.5 min)

1. As the doctor, on the confirmed appointment, click "+ Add diagnosis / prescription note"
   → fill in and save
2. Switch to the patient window → **Medical records** → the doctor's note appears
3. Also demo the patient self-uploading a lab report (any PDF/image file) via the same page

## Act 6 — AI Assistant (~2 min)

1. As the patient, go to **AI Assistant**
2. **Chat tab**: type "What foods help reduce cholesterol?" → show the response
   (mention it's a mock response unless you added an `OPENAI_API_KEY`)
3. **Symptom Checker tab**: fill in symptoms → submit → show the structured
   urgency/possible-conditions/recommendation card
4. **Emergency detection demo**: type "I have chest pain and can't breathe" in
   either tab → show it's intercepted immediately with an emergency warning,
   before ever reaching the AI — explain this is a deterministic safety net,
   independent of the AI model itself

## Act 7 — Reception (optional, ~1 min)

1. As admin, create a receptionist account (same form as Act 3, role = Receptionist)
2. Log in as reception → show "Register walk-in patient" and the cross-doctor
   appointment view filtered by date

## If asked "how did you test this?"

```bash
cd client && npm test    # 7 tests, Vitest + React Testing Library — all passing
cd server && npm test    # Jest + Supertest + in-memory MongoDB
```
Also show `.github/workflows/ci.yml` and the green checkmarks under your
GitHub repo's "Actions" tab if you've pushed to GitHub.

## If something breaks mid-demo

- Blank doctor list → you forgot Act 3 (create a doctor first)
- CORS error in browser console → `CLIENT_URL` in `server/.env` doesn't match
  the URL you're actually opening (should be `http://localhost:5173`)
- "Cannot connect to MongoDB" → check `MONGO_URI` and Atlas Network Access whitelist
- Blank page / white screen → check the browser console and the terminal
  running `npm run dev` for the actual error; 9 times out of 10 it's a typo
  in `.env` or a missing `npm install`
