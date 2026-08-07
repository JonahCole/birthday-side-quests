# Jonah's Unhinged Side Quest Challenge

A no-build-step, mobile-first web app using the 36 side-quest cards created in the ChatGPT conversation.

## What works
- Animated birthday present intro
- Easy Mode (quests 1–24)
- Hard Mode (quests 25–36)
- Animated dice roll and random quest selection
- Roll again without immediately repeating the same card
- Accept quest
- Download the actual card PNG
- Web Share API support (especially useful on iPhone for Save to Photos)
- Start over / change difficulty
- Tiny optional game sound effects generated in-browser
- PWA manifest + service worker for install/offline use after first load

## Run locally
Because browsers limit downloads/service workers from raw `file://` URLs, serve the folder locally:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy
This is a static site. Upload the contents of this folder to any static host:
- Netlify: drag the folder into Netlify Drop
- Vercel: create a project from the folder/repo; no build command needed
- GitHub Pages: commit files and enable Pages for the branch
- Cloudflare Pages: no framework/build command required

## Editing the deck
Quest metadata lives at the top of `app.js`. Card images are in `assets/cards/`.

To add a card:
1. Add the PNG to `assets/cards/`.
2. Add one entry to the `quests` array in `app.js`.
3. Give it `easy` or `hard` mode.

## Mobile saving note
Web browsers cannot silently place an image directly into the user's Photos library. `Accept Quest` starts a standard file download. The confirmation screen also includes **Share Quest**; on iPhone/iPad this opens the native share sheet where **Save Image** is available.
