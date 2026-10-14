# Complete Step-by-Step Guide (A to Z) — No Decisions, Just Follow Along

Do these in exact order. Don't skip ahead. Each step tells you exactly what
you should see when it worked.

---

## PART 1: Get the project running on YOUR computer first

### Step 1: Install Node.js
1. Go to https://nodejs.org
2. Click the button that says "LTS" (not "Current")
3. Run the installer, click Next through everything, finish
4. Open a terminal (Windows: search "Command Prompt" or "PowerShell" in your
   Start menu, per your screenshot's search bar) and type:
   ```
   node --version
   ```
5. **You should see:** something like `v20.11.0`. If you see an error instead,
   restart your computer and try again.

### Step 2: Extract your project zip
1. Find `mediai-pro-final.zip` in your Downloads folder
2. Right-click it → "Extract All" → choose a location you'll remember, e.g.
   `C:\Users\<you>\Documents\mediai-pro`
3. Open that extracted folder — you should see two folders inside: `client` and `server`

### Step 3: Set up MongoDB Atlas (your database)
1. Go to https://www.mongodb.com/cloud/atlas/register → sign up (free)
2. Click **Build a Database** → choose the **FREE (M0)** option → click Create
3. Wait for it to say your cluster is ready (~2 minutes)
4. You'll be asked to create a database user — type a username and password
   **and write them down somewhere**, you need them very soon
5. On the next screen ("Where would you like to connect from?"), click
   **Add My Current IP Address**, then ALSO click **Add a Different IP Address**
   and type `0.0.0.0/0` — this lets your deployed backend (later) connect too
6. Click **Finish and Close**
7. On your cluster's page, click the **Connect** button
8. Choose **Drivers**
9. Copy the long string shown — it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
10. Paste it somewhere temporary (Notepad) — you'll edit it in the next step

### Step 4: Fix up your connection string
In the string you copied, replace two things:
- `<username>` → the username you created in Step 3.4
- `<password>` → the password you created in Step 3.4

Then add `mediai-pro` right after `.net/`:

**Before:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
**After (example):**
```
mongodb+srv://myname:mypass123@cluster0.xxxxx.mongodb.net/mediai-pro?retryWrites=true&w=majority
```
Keep this final version in Notepad — this whole string is what we'll call
your **MONGO_URI** for the rest of this guide.

### Step 5: Configure the backend
1. Open a terminal, navigate into your project's server folder:
   ```
   cd C:\Users\<you>\Documents\mediai-pro\server
   ```
2. Type:
   ```
   npm install
   ```
   Wait for it to finish (can take 1-2 minutes).
3. Type:
   ```
   copy .env.example .env
   ```
   (On Mac/Linux this command would be `cp .env.example .env` instead)
4. Open the new `.env` file in that folder using Notepad or VS Code
5. Find the line `MONGO_URI=...` and replace everything after the `=` with
   your full connection string from Step 4
6. Generate two secret keys — back in your terminal, run this:
   ```
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the long output. In your `.env` file, paste it after `JWT_SECRET=`
7. Run that same command again (it gives a different result each time), copy
   the new output, paste it after `JWT_REFRESH_SECRET=`
8. Save the `.env` file

### Step 6: Start the backend
Still in your terminal (inside the `server` folder), type:
```
npm run dev
```
**You should see:**
```
Server running in development mode on port 5000
MongoDB Connected: cluster0-xxxxx.mongodb.net
```
If you see this, your database is connected. **Leave this terminal window
open and running** — don't close it.

### Step 7: Start the frontend
1. Open a **second, new** terminal window (leave the first one running)
2. Navigate to the client folder:
   ```
   cd C:\Users\<you>\Documents\mediai-pro\client
   ```
3. Type:
   ```
   npm install
   ```
4. Type:
   ```
   copy .env.example .env
   ```
5. Type:
   ```
   npm run dev
   ```
6. **You should see:** a line like `Local: http://localhost:5173/`
7. Open your web browser and go to `http://localhost:5173`
8. **You should see:** the MediAI Pro landing page with a hero image

If you got this far, your project works locally. Try registering an account
to confirm everything's connected properly before moving to deployment.

### Step 8: Create your first admin login
1. Open a **third** terminal window
2. Navigate to the server folder again:
   ```
   cd C:\Users\<you>\Documents\mediai-pro\server
   ```
3. Type:
   ```
   npm run seed
   ```
4. **You should see** an email and password printed — write these down,
   this is how you log in as an admin

---

## PART 2: Put the project online (deployment)

Only do this part once Part 1 is fully working. Deploying broken code just
gives you the same errors, harder to debug.

### Step 9: Push your code to GitHub
(Skip this if you've already connected a GitHub repo, like in your screenshots)
1. Go to https://github.com/new → create a new repository, don't check any boxes, click Create
2. In your terminal, inside the main `mediai-pro` folder (not client or server, the parent folder):
   ```
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

### Step 10: Deploy the backend on Render
1. Go to https://render.com → sign up/log in → **New +** → **Web Service**
2. Connect your GitHub repo (same one from Step 9)
3. Fill in:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Scroll down to **Environment Variables** → add these one by one:
   - `MONGO_URI` → paste your full connection string from Step 4
   - `JWT_SECRET` → paste the first secret you generated in Step 5.6
   - `JWT_REFRESH_SECRET` → paste the second secret from Step 5.7
   - `NODE_ENV` → type `production`
   - `CLIENT_URL` → type `http://localhost:5173` for now (we'll fix this in Step 12)
5. Click **Create Web Service** / **Deploy**
6. Wait for it to finish building (watch the Logs tab)
7. **You should see** a URL at the top like `https://mediai-pro-xxxx.onrender.com`
8. Test it: open that URL in your browser and add `/api/health` to the end, e.g.
   `https://mediai-pro-xxxx.onrender.com/api/health`
   **You should see:** `{"success":true,"message":"MediAI Pro API is running"}`
9. **Write down this Render URL** — you need it in the next step

### Step 11: Deploy the frontend on Vercel
1. Go to https://vercel.com → **Add New** → **Project** → import your GitHub repo
2. Set **Root Directory** to `client` (click Edit if needed to change it)
3. Under **Environment Variables**, add:
   - Key: `VITE_API_URL`
   - Value: your Render URL from Step 10.9, with `/api` added at the end, e.g.
     `https://mediai-pro-xxxx.onrender.com/api`
4. Click **Deploy**
5. Wait for it to finish
6. **You should see** a URL like `https://medi-ai-pro-2.vercel.app`
7. **Write down this Vercel URL** — you need it in the next step

### Step 12: Connect the two together (the step people forget)
1. Go back to your Render dashboard → your web service → **Environment** tab
2. Find `CLIENT_URL` → change its value from `http://localhost:5173` to your
   actual Vercel URL from Step 11.6, e.g. `https://medi-ai-pro-2.vercel.app`
3. Save — Render will automatically restart your backend with the new value

### Step 13: Final test
1. Open your Vercel URL in your browser
2. Try registering a new account
3. **You should see** the patient dashboard appear after registering

If this works, your project is fully live. If it doesn't, open your browser's
Developer Tools (press F12) → click the **Console** tab → tell me the exact
red error message you see there, and I can pinpoint exactly what's wrong.

---

## If you get stuck at ANY step

Copy the exact error message (don't paraphrase it) and tell me:
1. Which step number you were on
2. What you typed or clicked
3. The exact error text or screenshot

That's enough for me to tell you exactly what to fix.
