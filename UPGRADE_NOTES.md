# v6 card rendering fix

This patch changes the card loader to read the fetched image bytes and explicitly recreate them as an `image/png` Blob before displaying, downloading, or sharing them. This targets browsers that refuse to render a Blob whose server-provided MIME type is generic (for example `application/octet-stream`) even though navigating directly to the `.png` URL works.

Upload `index.html` and `app.js` to the repository root, replacing the existing files.
