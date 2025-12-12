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

// Clean public dir
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}

copyRecursive(srcDir, publicDir);
console.log(`Copied ${srcDir} to ${publicDir}`);

// Exit success
process.exit(0);
