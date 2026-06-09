# AlurKarya - Client-to-Paid Operating System

AlurKarya is a visual private workspace and Kanban dashboard designed for Indonesian digital freelancers, developers, and consultants. It helps manage clients, quotations, task lists, invoice tracking, and portfolio reviews in a single unified system.

---

## 🔒 Soft Buyer Access Gate (MVP)

AlurKarya features a **soft buyer access gate** to restrict view access to purchasers of the bundle.

> [!NOTE]
> This is a client-side MVP access protection mechanism designed to act as a soft gate for buyers. It is **not** a replacement for full server-side secure user login or databases.

### Hashing the Password

To prevent hardcoding plain text passwords, the access gate compares the SHA-256 hash of the entered password against the environment variable `VITE_ACCESS_PASSWORD_HASH`.

#### 1. Generating a Hash
You can generate a SHA-256 hash of your chosen password using Python or Node.js.

**Using Python:**
```bash
python -c "import hashlib; print(hashlib.sha256(b'your_password_here').hexdigest())"
```

**Using Node.js:**
```bash
node -e "crypto.subtle.digest('SHA-256', new TextEncoder().encode('your_password_here')).then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))"
```

#### 2. Local Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set `VITE_ACCESS_PASSWORD_HASH` to your generated SHA-256 hash:
```env
VITE_ACCESS_PASSWORD_HASH=your_sha256_hash_here
```

*Note: For local development (`npm run dev`), if the `.env` file does not exist or the build process has not been run, the app defaults to the password `alurkarya` for developer testing.*

---

## 🛠️ Local Development & Operations

The project includes standard scripts to run, build, and preview the app locally using Node.js without external server dependencies.

### 1. Installation
Install project tooling (contains zero production dependencies, keeping it lightweight):
```bash
npm install
```

### 2. Run Locally (Development)
Start the local server serving root files:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build Locally
Compile the production bundle (generates compiled assets inside the `dist/` directory and injects the active password hash from `.env` or system environment variables):
```bash
npm run build
```

### 4. Preview the Production Build
Preview the compiled files in `dist/` locally:
```bash
npm run preview
```
Open [http://localhost:3000](http://localhost:3000) to test.

---

## 🚀 Deploying to Render (Static Site)

Follow these settings to deploy AlurKarya on Render as a Static Site:

### Render Dashboard Settings

1. **Service Type:**
   Select **Static Site** when creating a new web service.

2. **Build Command:**
   ```bash
   npm install && npm run build
   ```

3. **Publish Directory:**
   ```
   dist
   ```

4. **Environment Variables:**
   Under the **Environment** tab of your Render service, add:
   - **Key:** `VITE_ACCESS_PASSWORD_HASH`
   - **Value:** *[Your generated SHA-256 hash]*

5. **SPA Redirect/Rewrite Rules:**
   To ensure client-side routing and page refreshes work correctly, configure a rewrite rule under **Redirects/Rewrites**:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
