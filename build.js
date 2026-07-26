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

const isProduction = env.NODE_ENV === 'production' || env.RENDER === 'true';
if (isProduction) {
  if (!passwordHash) {
    throw new Error('[AlurKarya Build] ERROR: VITE_ACCESS_PASSWORD_HASH is required for production build.');
  }
  if (!activationHash) {
    throw new Error('[AlurKarya Build] ERROR: VITE_ACTIVATION_CODE_HASH is required for production build.');
  }
}

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

// Copy explicit HTML pages required for deployment
const htmlFiles = [
  'index.html',
  'landing.html',
  'alurpandu-guided-start.html',
  'client-briefing.html'
];

htmlFiles.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(distPath, file);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`[AlurKarya Build] ERROR: Required source HTML file "${file}" is missing.`);
  }
  fs.copyFileSync(srcPath, destPath);
  console.log(`[AlurKarya Build] Copied ${file} to dist/`);
});

copyDirSync(path.join(__dirname, 'css'), path.join(distPath, 'css'));
copyDirSync(path.join(__dirname, 'js'), path.join(distPath, 'js'));
if (fs.existsSync(path.join(__dirname, 'assets'))) {
  copyDirSync(path.join(__dirname, 'assets'), path.join(distPath, 'assets'));
}

console.log('[AlurKarya Build] Copied static app assets');

// Inject password and activation hashes into the built AccessGate.js
const accessGatePath = path.join(distPath, 'js', 'components', 'AccessGate.js');
if (fs.existsSync(accessGatePath)) {
  let content = fs.readFileSync(accessGatePath, 'utf-8');
  content = content.replace('__VITE_ACCESS_PASSWORD_HASH__', passwordHash);
  content = content.replace('__VITE_ACTIVATION_CODE_HASH__', activationHash);
  fs.writeFileSync(accessGatePath, content, 'utf-8');
  console.log('[AlurKarya Build] Injected VITE_ACCESS_PASSWORD_HASH and VITE_ACTIVATION_CODE_HASH into AccessGate.js');
} else {
  throw new Error('[AlurKarya Build] ERROR: AccessGate.js not found in dist path. Verification required.');
}

// --- Automatic Build ID and Version Specifier Rewriting ---
const buildId = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
console.log(`[AlurKarya Build] Generated Build ID: ${buildId}`);

// Helper to recursively list files in directory
function getAllFiles(dir, extFilter = null) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extFilter));
    } else {
      if (!extFilter || file.endsWith(extFilter)) {
        results.push(filePath);
      }
    }
  });
  return results;
}

// 1. Process all JS module files in dist/js/ to inject build ID and version specifier
const jsFiles = getAllFiles(path.join(distPath, 'js'), '.js');
jsFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('__ALURKARYA_BUILD_ID__')) {
    content = content.replace(/__ALURKARYA_BUILD_ID__/g, buildId);
  }
  
  // Replace module specifiers: from './store.js' -> from './store.js?v=2026...'
  content = content.replace(/(from\s+['"])(\.\.?\/[^'"]+\.js)(?:\?[^'"]*)?(['"])/g, `$1$2?v=${buildId}$3`);
  content = content.replace(/(import\s+['"])(\.\.?\/[^'"]+\.js)(?:\?[^'"]*)?(['"])/g, `$1$2?v=${buildId}$3`);
  
  fs.writeFileSync(filePath, content, 'utf-8');
});
console.log(`[AlurKarya Build] Injected build version ${buildId} specifiers in ${jsFiles.length} JS modules.`);

// 2. Process all entry HTML files to version stylesheet and module script specifiers
const htmlFilesToVersion = [
  path.join(distPath, 'index.html'),
  path.join(distPath, 'landing.html'),
  path.join(distPath, 'alurpandu-guided-start.html'),
  path.join(distPath, 'client-briefing.html')
];

htmlFilesToVersion.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace script tags loading js modules
    content = content.replace(/(<script\s+[^>]*src=["'])([^"']+\.js)(?:\?[^"']*)?(["'])/gi, `$1$2?v=${buildId}$3`);
    
    // Replace link tags loading stylesheets
    content = content.replace(/(<link\s+[^>]*href=["'])([^"']+\.css)(?:\?[^"']*)?(["'])/gi, `$1$2?v=${buildId}$3`);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[AlurKarya Build] Injected build version ${buildId} into HTML assets of ${path.basename(filePath)}.`);
  }
});

// 3. Post-build asset verification
const requiredFiles = [
  'index.html',
  'landing.html',
  'alurpandu-guided-start.html',
  'client-briefing.html',
  'js/app.js',
  'css/style.css'
];

requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`[AlurKarya Build] ERROR: Post-build validation failed. Required output file "${file}" is missing.`);
  }
});

console.log('[AlurKarya Build] Output verification successful. All mandatory assets are present.');
console.log('[AlurKarya Build] Build completed successfully. Artifacts ready in dist/');
