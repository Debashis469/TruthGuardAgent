// Script to create a single SVG shield icon
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Single SVG shield icon
const shieldSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <!-- Shield shape -->
  <path d="M64 20 L90 40 L90 75 Q90 95 64 105 Q38 95 38 75 L38 40 Z" fill="white" stroke="white" stroke-width="3"/>
  <!-- Checkmark -->
  <path d="M55 60 L62 70 L75 50" fill="none" stroke="url(#grad)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Create single icon.svg file
const iconPath = path.join(iconsDir, 'icon.svg');
fs.writeFileSync(iconPath, shieldSVG);

console.log(
  '✅ Created icon.svg - Single shield icon with blue gradient and checkmark'
);
console.log('� Location: public/icons/icon.svg');
