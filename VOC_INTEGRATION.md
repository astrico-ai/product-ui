# VOC Integration Guide

This document explains how the Voice of Customer (VOC) application is integrated into the Product UI.

## Architecture

The VOC application is a **separate React application** running in parallel with the main Product UI, embedded via an iframe. This architecture provides:

- **Isolation**: VOC app has its own dependencies, build process, and state management
- **Independent Development**: Teams can work on VOC separately without affecting the main app
- **Technology Flexibility**: VOC uses React 19 + Vite 7 + Tailwind 4, while main app uses React 18
- **Easy Migration**: VOC can be extracted to a separate deployment if needed

## Directory Structure

```
product-ui/
├── src/                    # Main application
│   ├── pages/
│   │   └── VocPage.jsx    # VOC iframe wrapper with error handling
│   ├── components/
│   │   └── MainLayout.jsx # Navigation includes VOC link
│   └── App.jsx            # Route: /voc
└── voc/                   # Standalone VOC application
    ├── src/
    ├── package.json       # Separate dependencies
    └── vite.config.ts     # Port 5174 configuration
```

## How It Works

### 1. Navigation
The main app's `MainLayout.jsx` includes a "Voice of Customer" navigation item:
```jsx
{ icon: Radio, label: "Voice of Customer", path: "/voc" }
```

### 2. Routing
The main `App.jsx` defines the VOC route:
```jsx
<Route path="/voc" element={<MainLayout><VocPage /></MainLayout>} />
```

### 3. VocPage Component
`VocPage.jsx` is a wrapper component that:
- Embeds the VOC app via iframe (`http://localhost:5174`)
- Shows loading state while the iframe loads
- Detects if VOC app is not running and displays helpful error message
- Provides retry functionality

### 4. Port Configuration
The VOC app runs on port **5174** (configured in `voc/vite.config.ts`):
```ts
server: {
  port: 5174,
  strictPort: true,
}
```

The main app runs on port **5173** (default Vite port).

## Development Workflow

### Option 1: Run Both Apps Together (Recommended)
```bash
npm run dev:all
```
This starts both the main app (5173) and VOC app (5174) concurrently.

### Option 2: Run Separately
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:voc
```

### Option 3: VOC Only
```bash
cd voc
npm run dev
```

## Build Process

### Development Build
```bash
npm run build
```
This builds both applications sequentially.

### Production Deployment

**Option A: Single Server**
1. Build both apps: `npm run build`
2. Serve main app from root
3. Serve VOC app from `/voc` subdirectory or separate subdomain

**Option B: Separate Deployments**
1. Deploy main app to `app.example.com`
2. Deploy VOC app to `voc.example.com`
3. Update `VocPage.jsx` iframe src to point to production VOC URL
4. Configure CORS on VOC app to allow embedding

## Error Handling

`VocPage.jsx` includes comprehensive error handling:

1. **Loading State**: Shows spinner while iframe loads
2. **Connection Check**: Attempts to detect if VOC app is running
3. **Error Display**: Shows helpful message with instructions if VOC app is unavailable
4. **Retry**: Allows user to retry connection after starting VOC app

## Production Considerations

### Security
- **CSP Headers**: Configure Content Security Policy to allow iframe embedding
- **X-Frame-Options**: Set appropriate frame options on VOC app
- **CORS**: Configure CORS if VOC is on different domain

### Performance
- Consider lazy loading the iframe
- Implement message passing for better integration (postMessage API)
- Use service workers for offline capability

### Monitoring
- Track iframe load times
- Monitor VOC app availability
- Set up alerts for iframe errors

## Future Enhancements

### Seamless Integration
Replace iframe with:
- **Micro-frontend**: Use Module Federation or single-spa
- **Component Library**: Extract VOC components into shared library
- **Monorepo**: Use Nx or Turborepo for better code sharing

### Communication
Implement postMessage for:
- Shared authentication state
- Theme synchronization
- Navigation coordination
- Deep linking

### Example:
```js
// Main app
window.addEventListener('message', (event) => {
  if (event.origin === 'http://localhost:5174') {
    // Handle messages from VOC app
  }
});

// VOC app
window.parent.postMessage({ type: 'navigation', path: '/concerns' }, 'http://localhost:5173');
```

## Troubleshooting

### VOC app not loading
1. Check if VOC app is running: `lsof -i :5174`
2. Start VOC app: `npm run dev:voc`
3. Check browser console for iframe errors
4. Verify port 5174 is not blocked by firewall

### Styling issues in iframe
1. Ensure VOC app has all its CSS bundled
2. Check viewport meta tags
3. Verify Tailwind is configured correctly in VOC app

### State not syncing
- Implement postMessage communication
- Use shared localStorage (same origin only)
- Consider using a state management solution that works across apps

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start main app only (port 5173) |
| `npm run dev:voc` | Start VOC app only (port 5174) |
| `npm run dev:all` | Start both apps concurrently |
| `npm run build` | Build both apps |
| `npm run build:main` | Build main app only |
| `npm run build:voc` | Build VOC app only |
