#!/usr/bin/env node
/**
 * Generates Swell app icons from a single Quicksand "S".
 * Run: pnpm --filter swell generate-icons
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const FONT = path.resolve(
  ROOT,
  '../../node_modules/@expo-google-fonts/quicksand/Quicksand_700Bold.ttf'
);
const FONT_FALLBACK = path.join(
  ROOT,
  'node_modules/@expo-google-fonts/quicksand/Quicksand_700Bold.ttf'
);

const BG = '#0e141b';
const CORAL = '#ff7a59';
const WHITE = '#ffffff';

function fontPath() {
  if (fs.existsSync(FONT)) return FONT;
  if (fs.existsSync(FONT_FALLBACK)) return FONT_FALLBACK;
  throw new Error(`Quicksand Bold not found at ${FONT}`);
}

function letterSvg({ size, fill, background, fontSize, dy = 0 }) {
  const bg =
    background === 'transparent'
      ? ''
      : `<rect width="${size}" height="${size}" fill="${background}"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <text
    x="${size / 2}"
    y="${size / 2 + dy}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Quicksand"
    font-weight="700"
    font-size="${fontSize}"
    fill="${fill}"
  >S</text>
</svg>`;
}

function render(svg, outFile) {
  const resvg = new Resvg(svg, {
    font: {
      fontFiles: [fontPath()],
      loadSystemFonts: false,
      defaultFontFamily: 'Quicksand',
    },
  });
  fs.writeFileSync(outFile, resvg.render().asPng());
  console.log('wrote', path.relative(ROOT, outFile));
}

function main() {
  fs.mkdirSync(ASSETS, { recursive: true });

  render(
    letterSvg({ size: 1024, fill: CORAL, background: BG, fontSize: 640, dy: 24 }),
    path.join(ASSETS, 'icon.png')
  );

  render(
    letterSvg({
      size: 1024,
      fill: CORAL,
      background: 'transparent',
      fontSize: 560,
      dy: 20,
    }),
    path.join(ASSETS, 'splash-icon.png')
  );

  render(
    letterSvg({
      size: 1024,
      fill: CORAL,
      background: 'transparent',
      fontSize: 480,
      dy: 16,
    }),
    path.join(ASSETS, 'android-icon-foreground.png')
  );

  render(
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <rect width="1024" height="1024" fill="${BG}"/>
</svg>`,
    path.join(ASSETS, 'android-icon-background.png')
  );

  render(
    letterSvg({
      size: 1024,
      fill: WHITE,
      background: 'transparent',
      fontSize: 480,
      dy: 16,
    }),
    path.join(ASSETS, 'android-icon-monochrome.png')
  );

  render(
    letterSvg({ size: 192, fill: CORAL, background: BG, fontSize: 120, dy: 4 }),
    path.join(ASSETS, 'favicon.png')
  );

  const mark = letterSvg({
    size: 1024,
    fill: CORAL,
    background: 'transparent',
    fontSize: 640,
    dy: 24,
  });
  fs.writeFileSync(path.join(ASSETS, 'mark.svg'), mark);
  console.log('wrote assets/mark.svg');
}

main();
