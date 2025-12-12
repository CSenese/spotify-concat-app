const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const srcDir = path.resolve(__dirname, '..', 'src');
const publicDir = path.resolve(__dirname, '..', 'public');
const rootPagesDir = path.resolve(__dirname, '..', 'pages');
const rootFilesToCopy = ['index.html', 'index.js'];

// Clean public dir
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}

copyRecursive(srcDir, publicDir);
console.log(`Copied ${srcDir} to ${publicDir}`);

// Copy root pages folder if present
if (fs.existsSync(rootPagesDir)) {
  copyRecursive(rootPagesDir, path.join(publicDir, 'pages'));
  console.log(`Copied ${rootPagesDir} to ${path.join(publicDir, 'pages')}`);
}

// Copy root static files (index.html, index.js)
for (const f of rootFilesToCopy) {
  const filePath = path.resolve(__dirname, '..', f);
  if (fs.existsSync(filePath)) {
    const destPath = path.join(publicDir, f);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(filePath, destPath);
    console.log(`Copied ${filePath} to ${destPath}`);
  }
}

// Backwards-compatible paths: copy public/playlist-merger to public/pages/playlist-merger
const playlistMergerSrc = path.join(publicDir, 'playlist-merger');
const playlistMergerLegacyDest = path.join(publicDir, 'pages', 'playlist-merger');
if (fs.existsSync(playlistMergerSrc)) {
  copyRecursive(playlistMergerSrc, playlistMergerLegacyDest);
  console.log(`Copied ${playlistMergerSrc} to ${playlistMergerLegacyDest} for legacy path`);
}

// Exit success
process.exit(0);
