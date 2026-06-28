<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3f5dd73a-8a45-45ca-b644-5fe49a1ca1cd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Netlify

1. Push this repo to GitHub.
2. In Netlify, choose New site from Git and connect the repo.
3. Use `npm run build` as the build command.
4. Use `dist` as the publish directory.
5. Add the `GEMINI_API_KEY` environment variable in Netlify if you want AI recommendations enabled.
6. Deploy.

The site is configured for Netlify SPA hosting and `/api/*` requests are routed to a Netlify Function backed by Netlify Blobs.
