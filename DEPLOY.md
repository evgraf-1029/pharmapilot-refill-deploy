# PharmaPilot — Self-Hosting Guide
## Deploying to `pharmapilot.ca/safetydrugs`

This guide covers everything you need to move off Lovable and onto your own domain.

---

## What Was Changed (De-Lovable-ification)

| File | Change |
|---|---|
| `vite.config.ts` | Removed `lovable-tagger` import; added `base: "/safetydrugs/"` |
| `package.json` | Removed `lovable-tagger` from devDependencies |
| `index.html` | Removed Lovable OG/Twitter meta tags and image references |
| `playwright.config.ts` | Replaced `lovable-agent-playwright-config` with standard Playwright |
| `playwright-fixture.ts` | Replaced Lovable fixture with standard `@playwright/test` |

---

## Step 1 — Build the App

On your local machine (Node 18+ required):

```bash
cd pharmapilot-refill-hub
npm install
npm run build
```

This produces a `dist/` folder — these are the static files you'll upload.

---

## Step 2 — Upload to Your Server

Copy the contents of `dist/` to your web server under the `/safetydrugs` path:

```bash
# Example using rsync (replace with your server details)
rsync -avz dist/ user@pharmapilot.ca:/var/www/pharmapilot.ca/safetydrugs/
```

---

## Step 3 — Configure Your Web Server

### Option A — Apache (add to your `.htaccess` or VirtualHost)

```apache
<Directory "/var/www/pharmapilot.ca/safetydrugs">
  Options -Indexes
  AllowOverride All
  Require all granted
</Directory>

# Rewrite all routes to index.html (React Router needs this)
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /safetydrugs/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /safetydrugs/index.html [L]
</IfModule>
```

### Option B — Nginx (add inside your `server {}` block)

```nginx
location /safetydrugs/ {
  alias /var/www/pharmapilot.ca/safetydrugs/;
  index index.html;
  try_files $uri $uri/ /safetydrugs/index.html;
}
```

> **Why this matters:** React Router handles navigation client-side. Without the rewrite rule, refreshing any page (e.g. `/safetydrugs/dashboard`) returns a 404 from your server instead of loading the app.

---

## Step 4 — Environment Variables

Your app reads Supabase credentials from environment variables at **build time**. Create a `.env` file (or set these in your CI/CD pipeline) before running `npm run build`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

**Never commit `.env` to git.** These values are baked into the built JS bundle — use only the public anon key (not the service role key).

---

## Step 5 — Supabase Configuration

In your Supabase project dashboard, add your new domain to the allowed URLs:

1. Go to **Authentication → URL Configuration**
2. Add `https://pharmapilot.ca` to **Site URL**
3. Add `https://pharmapilot.ca/safetydrugs/**` to **Redirect URLs**

This is required for login/logout redirects to work correctly.

---

## Hosting Options (if you don't have a VPS)

| Platform | How | Notes |
|---|---|---|
| **Cloudflare Pages** | Connect GitHub repo, set build command `npm run build`, output `dist` | Free tier, global CDN |
| **Netlify** | Same as above, add `_redirects` file: `/* /index.html 200` | Free tier |
| **Vercel** | Import repo, auto-detects Vite | Free tier |
| **cPanel** | Upload `dist/` contents to `public_html/safetydrugs/`, add `.htaccess` from Step 3 | Common with Canadian hosts |

For any of these, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the platform's environment variable settings.

---

## Quick Checklist

- [ ] `npm run build` completes without errors
- [ ] `dist/` folder exists with `index.html` and `assets/`
- [ ] Files uploaded to server under `/safetydrugs/`
- [ ] Web server rewrite rule configured
- [ ] `.env` set with Supabase credentials before build
- [ ] Supabase redirect URLs updated to `pharmapilot.ca`
- [ ] Visit `https://pharmapilot.ca/safetydrugs` — app loads
- [ ] Login works and redirects correctly
