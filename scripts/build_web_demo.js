// Build script for apps/web static demo
// Generates apps/web/config.js with runtime API origin and WebSocket URL
const fs = require('fs');
const path = require('path');

const apiOrigin = process.env.API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/session';

const configContent = `// Auto-generated build config for Kavach Static Demo
window.__KAVACH_CONFIG__ = {
  apiOrigin: ${JSON.stringify(apiOrigin)},
  wsUrl: ${JSON.stringify(wsUrl)},
};
`;

const targetPath = path.join(__dirname, '..', 'apps', 'web', 'config.js');
fs.writeFileSync(targetPath, configContent, 'utf-8');
console.log(`[build_web_demo] Wrote config.js -> ${targetPath} (wsUrl: ${wsUrl})`);
