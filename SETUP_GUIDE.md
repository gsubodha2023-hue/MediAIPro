# Setup Guide — From Zip to Running App

## Step 0: You only need ONE zip file

If you've downloaded multiple zips from this conversation (`mediai-pro-step1-3.zip`,
`step1-4.zip`, etc.), **delete all but the last one** (`mediai-pro-final.zip`).
Each zip was a complete, cumulative snapshot — not a piece to be combined with
the others. There is nothing to "connect" between zips.

## Step 1: Extract the zip

- Windows: right-click the zip → "Extract All"
- Mac: double-click the zip
- Linux: `unzip mediai-pro-final.zip`

You should end up with a folder containing `client/`, `server/`, `README.md`,
`DEMO_SCRIPT.md`, `DEPLOYMENT.md`, etc. Open this folder in VS Code (or your editor).

## Step 2: Install prerequisites (if you haven't already)

1. **Node.js** (v20 or later) — download from nodejs.org, install, then verify:
   ```bash
   node --version
   npm --version
   ```
   Both should print a version number. If "command not found," Node isn't
   installed correctly — reinstall and restart your terminal.

---

## Step 3: MongoDB — two options

You need ONE of these, not both. **Option A (Atlas) is recommended** — no
installation, works immediately, and is what you'll use for deployment later
anyway. Option B (local) is useful if you want to work fully offline.

### Option A: MongoDB Atlas (cloud, recommended, ~5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account
2. Create a new project → Build a Database → choose the **free M0** tier
3. Choose a cloud provider/region (any is fine) → Create
4. **Create a database user**: you'll be prompted during setup — set a
   username and password. **Write these down**, you need them in step 5.
5. **Network Access**: add `0.0.0.0/0` (this means "allow connections from
   anywhere" — fine for development; a real production system would restrict this)
6. Once the cluster is ready, click **Connect** → **Drivers** → select Node.js
   → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with the actual values from step 4
   (if your password has special characters like `@` or `#`, URL-encode them —
   Atlas's UI usually gives you a "hide password" toggle that shows the
   already-encoded version, use that)
8. Add your database name right after `.net/`, before the `?`:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/mediai-pro?retryWrites=true&w=majority
   ```
   This full string is your `MONGO_URI` — you'll paste it into `server/.env` in Step 5.

### Option B: MongoDB installed locally on your machine

**Windows:**
1. Download the MSI installer from mongodb.com/try/download/community
2. Run it, choose "Complete" setup, keep "Install MongoDB as a Service" checked
3. This starts MongoDB automatically in the background as a Windows service
4. Your connection string will be: `mongodb://localhost:27017/mediai-pro`

**Mac (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```
Connection string: `mongodb://localhost:27017/mediai-pro`

**Linux (Ubuntu/Debian):**
```bash
# Follow the official instructions for your Ubuntu version at:
# https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
# (the exact commands depend on your Ubuntu release)
sudo systemctl start mongod
sudo systemctl enable mongod   # so it starts automatically on boot
```
Connection string: `mongodb://localhost:27017/mediai-pro`

**Verify it's running (any OS):**
```bash
mongosh
```
If this opens a `test>` prompt, MongoDB is running correctly. Type `exit` to leave.
If it fails to connect, the MongoDB service isn't running — check the service
status (`brew services list` on Mac, `sudo systemctl status mongod` on Linux,
Services app on Windows) and start it.

---

## Step 4: Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` in your editor and fill in:
```ini
MONGO_URI=<paste your connection string from Step 3 here>
JWT_SECRET=<generate below>
JWT_REFRESH_SECRET=<generate below>
```

Generate two different random secrets (run this command twice, use a
different output for each):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Leave `OPENAI_API_KEY` and the `EMAIL_*` fields blank for now — the app works
fine with mock AI/email responses.

Start the backend:
```bash
npm run dev
```
**You should see:**
```
Server running in development mode on port 5000
MongoDB Connected: cluster0-xxxxx.mongodb.net    (or "localhost" if using Option B)
```
If instead you see a connection error, see Troubleshooting below.

## Step 5: Frontend setup

Open a **new, separate terminal** (keep the backend one running):
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
You should see something like:
```
  ➜  Local:   http://localhost:5173/
```
Open that URL in your browser — you should see the MediAI Pro landing page.

## Step 6: Create your first admin account

Back in the backend terminal (or a third terminal, in the `server` folder):
```bash
npm run seed
```
This prints login credentials for a superadmin account. Use these to log in
and start creating doctor/receptionist accounts through the Admin Dashboard —
see `DEMO_SCRIPT.md` for the full walkthrough.

---

## Troubleshooting

**"MongoServerError: bad auth" or "Authentication failed"**
→ Your username/password in `MONGO_URI` is wrong, or a special character in
  the password wasn't URL-encoded. Double-check against Atlas → Database Access.

**"MongooseServerSelectionError" / connection timeout**
→ Atlas: check Network Access includes `0.0.0.0/0`.
→ Local: MongoDB service isn't running — see the "Verify it's running" step above.

**Backend starts but frontend shows network/CORS errors**
→ Confirm the backend is actually running on port 5000 (check that terminal
  for errors). Confirm `client/.env` has `VITE_API_URL=http://localhost:5000/api`.

**"command not found: npm" or "node"**
→ Node.js isn't installed or your terminal needs restarting after installation.

**Port 5000 or 5173 already in use**
→ Something else is using that port. Either stop it, or change `PORT` in
  `server/.env` (and update `VITE_API_URL` in `client/.env` to match).

**Still stuck?**
→ Copy the exact error message from your terminal — that's almost always
  enough to pinpoint the issue precisely.
