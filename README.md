
# EMESRT2 — Netlify LITE (No cache / No Blobs)

Deploy this when you see "No data / undefined" to validate that functions are built and reachable without Netlify Blobs.

## Deploy
1. Upload the **contents** of this folder to your GitHub repo root:
```
/site
/netlify/functions
netlify.toml
package.json
```
2. In Netlify Build settings, set:
   - Publish directory: `site`
   - Functions directory: `netlify/functions`
   - Build command: (empty)
   - Base directory: (empty)
3. Trigger **Clear cache and deploy site**.

## Test
- JSON live: `/.netlify/functions/emesrt-lite?mandates=1&subnational=1&frameworks=1`
- CSV  live: `/.netlify/functions/emesrt-lite?format=csv&mandates=1&subnational=1&frameworks=1`

If this works, the issue in your previous build was related to Blobs/scheduled cache. We can then switch back to the full package.

Generated: 2026-01-28T01:25:35.214396
