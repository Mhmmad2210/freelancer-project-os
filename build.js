import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables manually from .env if it exists
function loadEnv() {
  const env = { ...process.env };
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const index = trimmed.indexOf('=');
      if (index > -1) {
        const key = trimmed.substring(0, index).trim();
        const value = trimmed.substring(index + 1).trim().replace(/^['"]|['"]$/g, '');
        env[key] = value;
      }
    });
  }
  return env;
}

const env = loadEnv();
const passwordHash = env.VITE_ACCESS_PASSWORD_HASH || '';
const activationHash = env.VITE_ACTIVATION_CODE_HASH || '';

console.log('[AlurKarya Build] Initiating production build...');
console.log('[AlurKarya Build] Target VITE_ACCESS_PASSWORD_HASH status:', passwordHash ? 'Configured' : 'NOT FOUND (Using empty fallback)');
console.log('[AlurKarya Build] Target VITE_ACTIVATION_CODE_HASH status:', activationHash ? 'Configured' : 'NOT FOUND (Using empty fallback)');

const distPath = path.join(__dirname, 'dist');

// Clear existing dist directory
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath);

// Helper to copy directory recursively
function copyDirSync(src, dest, excludeFiles = []) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
      copyDirSync(srcPath, destPath, excludeFiles);
    } else {
      if (excludeFiles.includes(entry.name)) continue;
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy index.html, alurpandu-guided-start.html, and assets (landing.html is ignored as requested)
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distPath, 'index.html'));
if (fs.existsSync(path.join(__dirname, 'alurpandu-guided-start.html'))) {
  fs.copyFileSync(path.join(__dirname, 'alurpandu-guided-start.html'), path.join(distPath, 'alurpandu-guided-start.html'));
}
copyDirSync(path.join(__dirname, 'css'), path.join(distPath, 'css'));
copyDirSync(path.join(__dirname, 'js'), path.join(distPath, 'js'));
if (fs.existsSync(path.join(__dirname, 'assets'))) {
  copyDirSync(path.join(__dirname, 'assets'), path.join(distPath, 'assets'));
}

console.log('[AlurKarya Build] Copied static app assets (excluding landing.html)');

// Inject password and activation hashes into the built AccessGate.js
const accessGatePath = path.join(distPath, 'js', 'components', 'AccessGate.js');
if (fs.existsSync(accessGatePath)) {
  let content = fs.readFileSync(accessGatePath, 'utf-8');
  content = content.replace('__VITE_ACCESS_PASSWORD_HASH__', passwordHash);
  content = content.replace('__VITE_ACTIVATION_CODE_HASH__', activationHash);
  fs.writeFileSync(accessGatePath, content, 'utf-8');
  console.log('[AlurKarya Build] Injected VITE_ACCESS_PASSWORD_HASH and VITE_ACTIVATION_CODE_HASH into AccessGate.js');
} else {
  console.error('[AlurKarya Build] ERROR: AccessGate.js not found in dist path. Verification required.');
}

console.log('[AlurKarya Build] Build completed successfully. Artifacts ready in dist/');
