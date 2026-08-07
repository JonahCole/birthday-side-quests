# Jonah's Side Quests v2 update

## What changed
- Replaced flat Unicode dice with two fully CSS-rendered 3D dice with real pips.
- Dice now tumble independently, bounce into a tray, pulse the portal, and land on real random faces.
- Easy and Hard modes tint the dice/portal differently.
- Added changing arcade-style roll commentary during the animation.
- Bumped the service-worker cache to v2 so repeat visitors receive the new CSS/JS.

## Important: quest-card images
The app expects all 36 PNGs at these paths:

`assets/cards/quest_01.png` through `assets/cards/quest_36.png`

If the app shell works but cards do not, those files have not been committed at exactly that path/case.

## Easiest GitHub update
1. Unzip this package on a computer.
2. Open your `birthday-side-quests` repository on GitHub.
3. Choose **Add file > Upload files**.
4. Drag **all files and folders inside this package** into the upload area. GitHub can accept folders.
5. Confirm the upload preview shows `assets/cards/quest_01.png` etc.
6. Commit directly to `main`.
7. GitHub Pages will redeploy automatically.
8. On your phone, reload the site. If you installed it as a PWA or still see the old dice, fully close/reopen it or clear that site's cached data once.

## Fast image check
After deployment, directly visit:
`https://jonahcole.github.io/birthday-side-quests/assets/cards/quest_01.png`

If that image opens, the entire card-path setup is correct. If it is a 404, the `assets/cards` folder is missing or nested in the wrong directory.
