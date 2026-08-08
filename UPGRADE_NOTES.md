# v5 image-rendering fix

This version bypasses the browser image cache entirely for quest cards. The app now:

- fetches every selected card with `cache: no-store` and a unique cache-busting query string
- verifies the request succeeded
- creates a local Blob URL and renders that Blob in the `<img>` element
- prevents an older async image request from overwriting a newer roll
- reuses the same fresh-fetch path for Download and Share
- keeps service workers disabled while the app is under active development

Upload `index.html` and `app.js` to the repository root, replacing the current versions. `styles.css` can remain unchanged, but uploading the included copy is harmless.
