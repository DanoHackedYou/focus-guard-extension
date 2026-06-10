# Focus Guard Extension

A professional Chrome extension that helps users stay focused by blocking distracting websites during focus sessions and tracking time spent across domains.

#Screenshot

<img width="777" height="1203" alt="image" src="https://github.com/user-attachments/assets/01fe3aeb-0c27-4259-b5b1-51b3fa53d122" />

## Features

- Focus mode timer.
- Blocklist for distracting domains.
- In-page blocking overlay.
- Daily activity tracking by domain.
- Productivity progress score.
- Local-first data storage using Chrome storage.
- Manifest V3 extension architecture.
- React + TypeScript popup UI.
- GitHub Actions build workflow.

## Tech Stack

- React
- TypeScript
- Vite
- Chrome Extensions API
- Manifest V3
- GitHub Actions

## Project Structure

```txt
focus-guard-extension/
├── public/
│   └── icons/
├── scripts/
│   └── copy-manifest.js
├── src/
│   ├── components/
│   ├── lib/
│   ├── background.ts
│   ├── content.ts
│   ├── popup.tsx
│   └── styles.css
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Local Installation

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

Load it in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the generated `dist/` folder.

## Development

For checking TypeScript and building production assets:

```bash
npm run build
```

After every code change, rebuild and refresh the extension from `chrome://extensions`.

## Usage

1. Open the extension popup.
2. Add distracting websites such as `youtube.com`, `instagram.com` or `reddit.com`.
3. Start a focus session.
4. Visit a blocked domain to see the Focus Guard overlay.
5. Review the top visited domains in the popup.

## Roadmap

- Weekly productivity reports.
- Export activity as CSV.
- Custom focus schedules.
- Whitelist mode.
- Browser notifications.
- Dark/light theme toggle.
- Firefox support.

## GitHub Topics

```txt
chrome-extension
typescript
react
vite
productivity
focus-mode
browser-extension
portfolio-project
manifest-v3
```

## Status

MVP completed. Ready for portfolio and future improvements.

## License

MIT
