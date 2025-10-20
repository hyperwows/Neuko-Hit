# neuko-hit-game

Simple 9-hole head hit game. Deploy to Vercel as a static site.

## How to use
- The playable page is `src/index.html`
- Static assets are under `public/` (images and sounds)
- On GitHub: push repository, then import to Vercel (Framework: Other)

## Notes
- The `public/sounds/neuko.mp3` included is a small placeholder file. Replace it with your preferred MP3 for best audio.
- If the MP3 fails to play due to browser restrictions, the game falls back to Web Speech API (speechSynthesis) to say "Neuko".
- Ensure Vercel uses the provided `vercel.json` rewrite so `src/index.html` is served at the root.
