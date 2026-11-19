# Latent UI registry

A [shadcn registry](https://ui.shadcn.com/docs/registry) of Latent Defense components, plus a docs site that shows every component live.

- Docs: https://latent-ui-registry.shawn-be0.workers.dev
- Live demo (the triage app built from these components, fictional Acme data): https://latent-ui-registry.shawn-be0.workers.dev/demo/
- Registry files: https://latent-ui-registry.shawn-be0.workers.dev/r/<item>.json

## Using it in your app

Requirements: React 18+, Tailwind CSS v4, and a shadcn `components.json` in the project (`npx shadcn@latest init`).

1. Add the theme (tokens, light and dark, Tailwind mapping):

   ```bash
   npx shadcn@latest add https://latent-ui-registry.shawn-be0.workers.dev/r/theme.json
   ```

2. Import it once, after Tailwind:

   ```css
   /* src/index.css */
   @import "tailwindcss";
   @import "./styles/latent.css";
   ```

3. Add components. Their dependencies install automatically:

   ```bash
   npx shadcn@latest add https://latent-ui-registry.shawn-be0.workers.dev/r/data-table.json
   ```

4. Wrap the app once in `<TooltipProvider>` (and `<ToastProvider>` if you use toasts). Dark mode follows the `dark` class on `<html>`.

Fonts: Inter and DM Mono (Google Fonts).

## Items

theme, utils, icons, object-icons, tooltip, button, badge, count-chip, input, status-select, tabs, toolbar, menu, content, form, dialog, data-table, attack-path, sidebar, logo

## Working on it

```bash
nvm use            # Node 22
npm install
npm run dev        # docs site on http://localhost:5190
npm run build      # typecheck + registry JSON (public/r) + docs site (dist)
```

The live demo is a prebuilt copy of the Latent Defense React app, committed in `demo/` and copied to `dist/demo/` by `npm run build` (`scripts/copy-demo.mjs`). To refresh it, run `npm run build:demo` in the app (builds with base `/demo/` into `../registry/demo`), then rebuild and deploy here.

Component sources live in `registry/latent/`. Add or change an item in `registry.json`, then rebuild.

## Hosting (Cloudflare Workers)

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (serves `dist`, see wrangler.jsonc)
- Environment variable: `NODE_VERSION = 22`

`public/_headers` lets the shadcn CLI fetch `/r/*.json` from other origins.
