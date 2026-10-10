const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');
const distDir = path.join(__dirname, '../dist');

if (fs.existsSync(outDir)) {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.cpSync(outDir, distDir, { recursive: true });
  console.log('✅ Successfully synced out/ -> dist/ for Cloudflare Pages compatibility.');
} else {
  console.warn('⚠️ out directory not found, skipping sync.');
}
