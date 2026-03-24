# Browser Tinder Insights

Browser-only Tinder insights generator. Upload either a Tinder `data.json` export or a `.zip` containing `data.json`, and the app renders a portrait SVG tree showing:

- total swipes
- left vs right swipes
- matches vs no match
- chats vs no chats
- chats with `>=5` messages vs chats with `<5` messages

All parsing happens locally in the browser.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

## Test

```bash
npm test
```

## Build

```bash
npm run build
npm run preview
```

## Browser Verification With Playwright CLI

Start the app in another terminal:

```bash
npm run dev
```

Then run:

```bash
npm run verify:browser
```

The verification script opens the app with Playwright CLI, uploads `data/Joan/data.json`, captures snapshots, and checks that the success state and insights tree are present.

If `playwright-cli` is not installed globally, the script falls back to `npx playwright-cli`.
