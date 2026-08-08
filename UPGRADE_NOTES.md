# v4 image loading fix

Upload/replace `index.html`, `app.js`, and `styles.css` at the repository root. This build removes service-worker registration, clears old Cache Storage, forces fresh JS/CSS via `?v=4`, and uses plain relative card paths like `./assets/cards/quest_01.png?v=4`.
