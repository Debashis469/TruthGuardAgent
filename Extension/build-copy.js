// Script to copy necessary files to dist folder after build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
const manifestSrc = path.join(publicDir, 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('✓ Copied manifest.json');
}

// Copy content.css
const contentCssSrc = path.join(publicDir, 'content.css');
const contentCssDest = path.join(distDir, 'content.css');
if (fs.existsSync(contentCssSrc)) {
  fs.copyFileSync(contentCssSrc, contentCssDest);
  console.log('✓ Copied content.css');
}

// Copy icons directory
const iconsSrc = path.join(publicDir, 'icons');
const iconsDest = path.join(distDir, 'icons');
if (fs.existsSync(iconsSrc)) {
  if (!fs.existsSync(iconsDest)) {
    fs.mkdirSync(iconsDest, { recursive: true });
  }

  const files = fs.readdirSync(iconsSrc);
  files.forEach((file) => {
    const src = path.join(iconsSrc, file);
    const dest = path.join(iconsDest, file);
    fs.copyFileSync(src, dest);
  });
  console.log('✓ Copied icons directory');
}

console.log('✓ Build completed successfully!');
