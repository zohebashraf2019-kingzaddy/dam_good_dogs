# Dam Good Dogs — Reno Hot Dog Cart

Static website for **Dam Good Dogs**, the Reno, NV hot dog cart run by Timothy & Lisa.
Built by [Nexora Digital](https://www.nexoradigital.live).

## Sections
- Hero with looping cart video and a live "Today's spot" status (Reno time)
- Find the Cart: weekly schedule (today highlighted), locations with Maps links, dated pop-ups (auto-hide after the date)
- Menu: Jackpot Dog $7.77, Whole Dam Deal $10, sides & drinks, Dirty Fritos
- "Spin your Jackpot" topping slot machine
- Videos, photo gallery with lightbox, monthly video contest
- Our Story, Events & Catering request form (opens email to damgooddogs@gmail.com)

## Updating
- **Prices/menu:** `index.html` → `#menu` section
- **Weekly schedule & pop-ups:** `script.js` → `SCHEDULE` and `POPUPS`, plus the `.popup` cards in `index.html`
- **Photos/videos:** `assets/img`, `assets/video`

## Deploy
Plain HTML/CSS/JS, no build step. Import the repo in Vercel with the "Other" framework preset.
