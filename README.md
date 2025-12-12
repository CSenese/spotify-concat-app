# spotify-concat-app — project layout & Vercel configuration

This repo uses `src/` as the source-of-truth and is configured to serve `src/` directly on Vercel by default. `public/` is available as an optional build output and is tracked in the repository by default.

Recommended layout
- `src/` — all source files (HTML, JS, CSS, classes/, functions/, playlist-merger/)
- `public/` — build output (what you serve; generally the result of `npm run build`)
- `pages/` — Removed: repo has been consolidated to keep all code under `src/` and no duplicates outside `src`.

Why this is a good setup
- Keeps source files under `src/`, making it clear which files are edited directly.
- Build artifacts in `public/` are kept separate; `public/` is tracked in VCS by default in this repo.

How Vercel is currently configured
- `vercel.json` is configured to serve files directly from `src/` using `@vercel/static` and routes. There is also a backup of the previous configuration in `vercel-old.json` if you need the build-based deployment that outputs to `public/`.
  - This serves raw source files from `src/` with no build step. If you need a build step, you can revert to `vercel-old.json` or use the `build` script (note: the `build` script is currently a no-op message by default; if you prefer a true build step, change it to a script that produces `public/`).

Two common choices to deploy
1. Serve `src/` directly (current setup)
  - `vercel.json` serves files directly from `src/` using `@vercel/static` and routes.
  - Pros: No build step required; quick iterations and simple static HTML/JS/CSS deployment.
  - Cons: No build step for bundling or production optimization.

2. Keep a `build` + `public` approach (if you want a build step)
  - Restore or use `vercel-old.json`, or set the project's Build Command and Output Directory in the Vercel UI to run `npm run build` and serve `public/`.
  - Pros: Allows minification, bundling, or build-time code generation; better for production optimizations.

```json
{
  "version": 2,
  "builds": [
    { "src": "src/**/*", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/", "dest": "src/index.html" },
    { "src": "/(.*)", "dest": "src/$1" }
  ]
}
```

  - Pros: Vercel serves files straight from `src` with no build step.
  - Cons: If you want to transform or produce production output (minify, bundle, add polyfills), you'll lose that build step.

Cleaning up duplicates
- This repo has been consolidated: duplicates outside `src/` were removed (e.g., `pages/` and `dist/`). Keep `src/` as the single source-of-truth and reduce duplication.
  - Keep everything editable inside `src/`.
  - Optionally use `public/` or a bundler/build step when you want optimized builds.

Note about the removed build script
- The repo previously included `scripts/copy-src-to-public.js` and `npm run build` ran that script — this script was removed to keep `src/` as the default serving location and reduce complexity. If you rely on generating `public/`, add your own build command and script and update `vercel.json` or use `vercel-old.json`. 

Local preview
- Serve the `src` folder locally using a static server (recommended for this config):

```bash
npx serve src
# or
npx http-server src
```

- If you want to preview the build output instead: `npm run build`, then serve `public/`:

```bash
npm run build
npx serve public
```

Vercel config in the Dashboard
- You can set the project Root Directory and build commands in the Vercel dashboard if you'd rather not edit `vercel.json`.

Questions or next steps
- Want me to move duplicates into `src/` and remove root duplications? I can perform the changes and create a single layout to prevent future confusion.

---
Generated on Dec 12, 2025

Node, package managers and Vercel
- `package.json` lists declared dependencies and scripts in your repo; `package-lock.json` captures an exact dependency tree and the resolved package versions. Commit both so builds are reproducible.
- Vercel detects which package manager to use by looking for lockfiles (e.g. `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`). If `package-lock.json` is present, Vercel uses `npm` and will usually run `npm ci` (or the equivalent) to install dependencies exactly as written in the lockfile.
- During the install phase, `@supabase/supabase-js` (listed under `dependencies`) will be installed into the build environment's `node_modules` tree and made available to any build step or serverless functions on Vercel.

How this affects a static site
- Vercel installs dependencies (based on `package-lock.json`) during builds — but if your site is purely static and you are not running a bundler, bare module imports like `import { createClient } from '@supabase/supabase-js'` in client code won't work directly in a browser because browsers don't resolve Node-style import paths by default.
- You have two common approaches:
  - Use Supabase from a CDN (no build step required):
    - Example: add an ES module import in your HTML that points to a CDN.
      ```html
      <script type="module">
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
        const supabase = createClient('https://your-supabase-url', 'PUBLIC_KEY');
        // use supabase in the browser
      </script>
      ```
    - Or set up an `importmap` mapping `@supabase/supabase-js` to a CDN URL and keep using `import` in your modules.
  - Use a bundler (build step) to resolve npm dependencies and produce a single client bundle (recommended for modern apps):
    - Add a bundler such as `esbuild`, `rollup` or `webpack`, update the `build` script in `package.json` to bundle `src/index.js` and write output to `public/`.
    - Vercel will install dependencies using `package-lock.json` and run your build script; the bundler will bundle `@supabase/supabase-js` into your final JS file.

Dev vs runtime dependencies
- `dependencies` will be installed both for build and runtime (so they are available to serverless functions or bundlers). `devDependencies` are typically only used for building (bundlers, linters, etc). On Vercel, devDependencies are installed during build as long as your project has a build step.

Quick commands locally
- Install exact versions from `package-lock.json`: `npm ci`
- Update a package and refresh the lockfile: `npm i @supabase/supabase-js@latest` (or a specific version). Then commit `package-lock.json`.
- Check installed version: `npm ls @supabase/supabase-js`

If you'd like, I can:
- Add an example `esbuild` bundle command so `import` works in the browser, or
- Replace bare imports with CDN-based imports and examples to keep the repo buildless.
