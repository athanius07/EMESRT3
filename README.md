
# EMESRT2 — Netlify Deploy (Fixed Blobs Initialization)

This package contains the **working** Netlify setup with Blobs initialization fixed via `connectLambda(event)` in both functions.

## Upload to GitHub
1. Extract this ZIP. You will see the folder `EMESRT2-netlify-fixed`.
2. Open that folder and upload **its contents** (not the folder itself) to your GitHub repo **root**, so you have:
```
/site
/netlify/functions
netlify.toml
package.json
```

## Configure Netlify
- Publish directory: `site`
- Functions directory: `netlify/functions`
- Build command: *(leave empty)*
- Base directory: *(leave empty)*

Then deploy. Verify under **Site → Functions** that you see `emesrt` and `refresh`.

## Test endpoints
- JSON live: `/.netlify/functions/emesrt?cached=0&mandates=1&subnational=1&frameworks=1`
- CSV  live: `/.netlify/functions/emesrt?format=csv&cached=0&mandates=1&subnational=1&frameworks=1`

Generated: 2026-01-28T01:07:12.730642
