# Install

## Prerequisites

- Node.js
- npm

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

The app accepts either:

- a Tinder `data.json` export
- a `.zip` file that contains `data.json`

## Production Build

```bash
npm run build
npm run preview
```

## Tests

Run the automated test suite:

```bash
npm test
```

## Browser Verification

Start the app in one terminal:

```bash
npm run dev
```

Run the verification script in another terminal:

```bash
npm run verify:browser
```

The script opens the app, uploads `data/Joan/data.json`, captures snapshots, and verifies that the rendered insights tree appears correctly.

If `playwright-cli` is not installed globally, the script falls back to `npx playwright-cli`.

## Deployment

Push to `main` to deploy through GitHub Actions to:

`https://overclockedsoul.github.io/tinder_forensica/`
