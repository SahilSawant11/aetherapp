#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const iosIconSet = path.join(root, 'ios/aetherapp/Images.xcassets/AppIcon.appiconset');
const androidRes = path.join(root, 'android/app/src/main/res');
const sourceAsset = path.join(root, 'src/assets/app-icon.png');

const background = [16, 185, 129, 255];
const foreground = [255, 255, 255, 255];

const iosIcons = [
  { filename: 'AppIcon-20@2x.png', size: 40, idiom: 'iphone', scale: '2x', points: '20x20' },
  { filename: 'AppIcon-20@3x.png', size: 60, idiom: 'iphone', scale: '3x', points: '20x20' },
  { filename: 'AppIcon-29@2x.png', size: 58, idiom: 'iphone', scale: '2x', points: '29x29' },
  { filename: 'AppIcon-29@3x.png', size: 87, idiom: 'iphone', scale: '3x', points: '29x29' },
  { filename: 'AppIcon-40@2x.png', size: 80, idiom: 'iphone', scale: '2x', points: '40x40' },
  { filename: 'AppIcon-40@3x.png', size: 120, idiom: 'iphone', scale: '3x', points: '40x40' },
  { filename: 'AppIcon-60@2x.png', size: 120, idiom: 'iphone', scale: '2x', points: '60x60' },
  { filename: 'AppIcon-60@3x.png', size: 180, idiom: 'iphone', scale: '3x', points: '60x60' },
  { filename: 'AppIcon-1024.png', size: 1024, idiom: 'ios-marketing', scale: '1x', points: '1024x1024' },
];

const androidIcons = [
  { directory: 'mipmap-mdpi', size: 48 },
  { directory: 'mipmap-hdpi', size: 72 },
  { directory: 'mipmap-xhdpi', size: 96 },
  { directory: 'mipmap-xxhdpi', size: 144 },
  { directory: 'mipmap-xxxhdpi', size: 192 },
];

function crc32(buffer) {
  let crc = -1;
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function writePng(filename, width, height, pixels) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  const rowBytes = width * 4 + 1;
  const raw = Buffer.alloc(rowBytes * height);

  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * rowBytes;
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(
    filename,
    Buffer.concat([
      header,
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  );
}

function inPolygon(x, y, polygon) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
    const point = polygon[current];
    const lastPoint = polygon[previous];
    const intersects =
      point.y > y !== lastPoint.y > y &&
      x < ((lastPoint.x - point.x) * (y - point.y)) / (lastPoint.y - point.y) + point.x;

    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function distanceToSegment(x, y, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared));
  const closestX = start.x + t * dx;
  const closestY = start.y + t * dy;

  return Math.hypot(x - closestX, y - closestY);
}

function renderIcon(size) {
  const samples = 4;
  const pixels = Buffer.alloc(size * size * 4);
  const scale = size * 0.68;
  const offset = (size - scale) / 2;
  const strokeWidth = (1.5 / 24) * scale;

  const map = ([x, y]) => ({
    x: offset + (x / 24) * scale,
    y: offset + (y / 24) * scale,
  });

  const top = [
    map([12, 3]),
    map([1.75, 8.5]),
    map([12, 14]),
    map([22.25, 8.5]),
  ];
  const body = [
    map([5.5, 10.5]),
    map([5.5, 14.75]),
    map([5.65, 15.77]),
    map([6.32, 16.65]),
    map([7.45, 17.35]),
    map([8.93, 17.87]),
    map([10.46, 18.15]),
    map([12, 18.25]),
    map([13.54, 18.15]),
    map([15.07, 17.87]),
    map([16.55, 17.35]),
    map([17.68, 16.65]),
    map([18.35, 15.77]),
    map([18.5, 14.75]),
    map([18.5, 10.5]),
    map([12, 14]),
  ];
  const tassel = [map([22.25, 8.5]), map([22.25, 14.5])];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let coverage = 0;

      for (let sampleY = 0; sampleY < samples; sampleY += 1) {
        for (let sampleX = 0; sampleX < samples; sampleX += 1) {
          const px = x + (sampleX + 0.5) / samples;
          const py = y + (sampleY + 0.5) / samples;
          const fillHit = inPolygon(px, py, top) || inPolygon(px, py, body);
          const strokeHit = distanceToSegment(px, py, tassel[0], tassel[1]) <= strokeWidth / 2;
          const capHit = distanceToSegment(px, py, tassel[1], tassel[1]) <= strokeWidth / 2;

          if (fillHit || strokeHit || capHit) {
            coverage += 1;
          }
        }
      }

      const alpha = coverage / (samples * samples);
      const index = (y * size + x) * 4;
      pixels[index] = Math.round(background[0] * (1 - alpha) + foreground[0] * alpha);
      pixels[index + 1] = Math.round(background[1] * (1 - alpha) + foreground[1] * alpha);
      pixels[index + 2] = Math.round(background[2] * (1 - alpha) + foreground[2] * alpha);
      pixels[index + 3] = 255;
    }
  }

  return pixels;
}

function writeIosContents() {
  const contents = {
    images: iosIcons.map((icon) => ({
      filename: icon.filename,
      idiom: icon.idiom,
      scale: icon.scale,
      size: icon.points,
    })),
    info: {
      author: 'xcode',
      version: 1,
    },
  };

  fs.writeFileSync(
    path.join(iosIconSet, 'Contents.json'),
    `${JSON.stringify(contents, null, 2).replace(/"([^"]+)":/g, '"$1" :')}\n`,
  );
}

function writeAndroidAdaptiveIcons() {
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="app_icon_background">#10B981</color>\n</resources>\n`;
  const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/app_icon_background" />\n    <foreground android:drawable="@drawable/ic_launcher_foreground" />\n</adaptive-icon>\n`;
  const foregroundXml = `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android"\n    android:width="108dp"\n    android:height="108dp"\n    android:viewportWidth="108"\n    android:viewportHeight="108">\n    <group\n        android:translateX="18"\n        android:translateY="18"\n        android:scaleX="3"\n        android:scaleY="3">\n        <path\n            android:fillColor="#FFFFFF"\n            android:pathData="M12,3L1.75,8.5L12,14L22.25,8.5L12,3ZM5.5,10.5V14.75C5.5,16.73 8.41,18.25 12,18.25C15.59,18.25 18.5,16.73 18.5,14.75V10.5L12,14L5.5,10.5Z" />\n        <path\n            android:fillColor="#00000000"\n            android:strokeColor="#FFFFFF"\n            android:strokeWidth="1.5"\n            android:strokeLineCap="round"\n            android:strokeLineJoin="round"\n            android:pathData="M22.25,8.5V14.5" />\n    </group>\n</vector>\n`;

  fs.mkdirSync(path.join(androidRes, 'values'), { recursive: true });
  fs.mkdirSync(path.join(androidRes, 'drawable'), { recursive: true });
  fs.mkdirSync(path.join(androidRes, 'mipmap-anydpi-v26'), { recursive: true });

  fs.writeFileSync(path.join(androidRes, 'values/colors.xml'), colorsXml);
  fs.writeFileSync(path.join(androidRes, 'drawable/ic_launcher_foreground.xml'), foregroundXml);
  fs.writeFileSync(path.join(androidRes, 'mipmap-anydpi-v26/ic_launcher.xml'), adaptiveIconXml);
  fs.writeFileSync(path.join(androidRes, 'mipmap-anydpi-v26/ic_launcher_round.xml'), adaptiveIconXml);
}

for (const icon of iosIcons) {
  writePng(path.join(iosIconSet, icon.filename), icon.size, icon.size, renderIcon(icon.size));
}

for (const icon of androidIcons) {
  const pixels = renderIcon(icon.size);
  writePng(path.join(androidRes, icon.directory, 'ic_launcher.png'), icon.size, icon.size, pixels);
  writePng(path.join(androidRes, icon.directory, 'ic_launcher_round.png'), icon.size, icon.size, pixels);
}

writePng(sourceAsset, 1024, 1024, renderIcon(1024));
writeIosContents();
writeAndroidAdaptiveIcons();
