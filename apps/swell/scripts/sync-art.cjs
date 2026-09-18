#!/usr/bin/env node
/**
 * sync-art — copies illustrations from apps/swell/assets into the engine
 * package (where the screens actually `require()` them), downscaling to a
 * sane display size so the bundle stays lean.
 *
 * Run:  pnpm sync-art        (from apps/swell)
 *
 * Why this exists: the onboarding/art images are imported from
 * packages/engine/src/assets/**, NOT from apps/swell/assets. Editing the app
 * copy alone has no effect on screen. This keeps the engine copies in sync.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const APP_ASSETS = path.resolve(__dirname, '..', 'assets');
const ENGINE_ASSETS = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'packages',
  'engine',
  'src',
  'assets'
);

// name -> engine subfolder. All display art is capped at 720px.
const MAP = {
  onboarding: ['wave', 'time', 'play', 'body', 'future', 'deal'],
  art: ['victory', 'streak', 'milestone', 'money', 'empty', 'breathe'],
};

const MAX_SIZE = 720;

function hasSips() {
  try {
    execFileSync('sips', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function main() {
  const sips = hasSips();
  let copied = 0;
  let missing = [];

  for (const [folder, names] of Object.entries(MAP)) {
    const destDir = path.join(ENGINE_ASSETS, folder);
    fs.mkdirSync(destDir, { recursive: true });

    for (const name of names) {
      const src = path.join(APP_ASSETS, `${name}.png`);
      const dest = path.join(destDir, `${name}.png`);
      if (!fs.existsSync(src)) {
        missing.push(name);
        continue;
      }
      fs.copyFileSync(src, dest);
      if (sips) {
        // Downscale the destination copy in place (never touches the app source).
        execFileSync('sips', ['-Z', String(MAX_SIZE), dest], { stdio: 'ignore' });
      }
      copied += 1;
      console.log(`  ✓ ${name}.png  →  engine/${folder}/`);
    }
  }

  console.log(`\nSynced ${copied} image(s) into the engine package.`);
  if (!sips) {
    console.log(
      'Note: `sips` not found — images were copied at full size (no downscale).'
    );
  }
  if (missing.length) {
    console.log(`Skipped (not in app assets): ${missing.join(', ')}`);
  }
  console.log('Reload the app (press "r" in Expo) to see the changes.');
}

main();
