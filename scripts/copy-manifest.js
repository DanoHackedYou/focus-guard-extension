import { copyFileSync, mkdirSync, cpSync } from 'node:fs';
import { dirname } from 'node:path';

mkdirSync('dist', { recursive: true });
copyFileSync('manifest.json', 'dist/manifest.json');
mkdirSync(dirname('dist/icons/icon-16.png'), { recursive: true });
cpSync('public/icons', 'dist/icons', { recursive: true });
console.log('Manifest and icons copied to dist.');
