#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const docsDir = path.join(root, 'docs');

if (!fs.existsSync(distDir)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

// Replace docs with static build output so GitHub Pages serves the app.
fs.rmSync(docsDir, { recursive: true, force: true });
fs.mkdirSync(docsDir, { recursive: true });
fs.cpSync(distDir, docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');

console.log(`Published ${distDir} -> ${docsDir}`);
