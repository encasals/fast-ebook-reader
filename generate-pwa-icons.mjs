import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir, copyFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = join(__dirname, 'icons', 'web');
const outputDir = join(__dirname, 'public', 'icons');
const publicDir = join(__dirname, 'public');

// Source files from icons/web
const regularIcon = join(sourceDir, 'icon-512.png');
const maskableIcon = join(sourceDir, 'icon-512-maskable.png');
const favicon = join(sourceDir, 'favicon.ico');

// App theme colors (from tailwind.config.js)
const backgroundColor = { r: 250, g: 248, b: 245, alpha: 1 }; // #faf8f5 (paper.bg)
const darkBackgroundColor = { r: 28, g: 25, b: 23, alpha: 1 }; // #1c1917 (night.bg)

// PWA icon sizes needed
const iconSizes = [
  // Standard PWA icons
  { name: 'icon-72x72.png', size: 72, src: 'regular' },
  { name: 'icon-96x96.png', size: 96, src: 'regular' },
  { name: 'icon-128x128.png', size: 128, src: 'regular' },
  { name: 'icon-144x144.png', size: 144, src: 'regular' },
  { name: 'icon-152x152.png', size: 152, src: 'regular' },
  { name: 'icon-192x192.png', size: 192, src: 'regular' },
  { name: 'icon-384x384.png', size: 384, src: 'regular' },
  { name: 'icon-512x512.png', size: 512, src: 'regular' },
  
  // Maskable icons (for Android adaptive icons)
  { name: 'maskable-icon-192x192.png', size: 192, src: 'maskable' },
  { name: 'maskable-icon-384x384.png', size: 384, src: 'maskable' },
  { name: 'maskable-icon-512x512.png', size: 512, src: 'maskable' },
  
  // Apple touch icons
  { name: 'apple-touch-icon.png', size: 180, src: 'regular' },
  { name: 'apple-touch-icon-120x120.png', size: 120, src: 'regular' },
  { name: 'apple-touch-icon-152x152.png', size: 152, src: 'regular' },
  { name: 'apple-touch-icon-167x167.png', size: 167, src: 'regular' },
  { name: 'apple-touch-icon-180x180.png', size: 180, src: 'regular' },
  
  // Favicon sizes
  { name: 'favicon-16x16.png', size: 16, src: 'regular' },
  { name: 'favicon-32x32.png', size: 32, src: 'regular' },
];

// Apple splash screen sizes (iPhone and iPad)
const splashScreens = [
  // iPhone
  { name: 'apple-splash-640-1136.png', width: 640, height: 1136 },   // iPhone 5
  { name: 'apple-splash-750-1334.png', width: 750, height: 1334 },   // iPhone 6/7/8
  { name: 'apple-splash-828-1792.png', width: 828, height: 1792 },   // iPhone XR
  { name: 'apple-splash-1125-2436.png', width: 1125, height: 2436 }, // iPhone X/XS
  { name: 'apple-splash-1170-2532.png', width: 1170, height: 2532 }, // iPhone 12/13
  { name: 'apple-splash-1179-2556.png', width: 1179, height: 2556 }, // iPhone 14/15 Pro
  { name: 'apple-splash-1242-2208.png', width: 1242, height: 2208 }, // iPhone 6+/7+/8+
  { name: 'apple-splash-1242-2688.png', width: 1242, height: 2688 }, // iPhone XS Max
  { name: 'apple-splash-1284-2778.png', width: 1284, height: 2778 }, // iPhone 12/13 Pro Max
  { name: 'apple-splash-1290-2796.png', width: 1290, height: 2796 }, // iPhone 14/15 Pro Max
  // iPad
  { name: 'apple-splash-1536-2048.png', width: 1536, height: 2048 }, // iPad Mini/Air
  { name: 'apple-splash-1620-2160.png', width: 1620, height: 2160 }, // iPad 10.2"
  { name: 'apple-splash-1668-2224.png', width: 1668, height: 2224 }, // iPad Pro 10.5"
  { name: 'apple-splash-1668-2388.png', width: 1668, height: 2388 }, // iPad Pro 11"
  { name: 'apple-splash-2048-2732.png', width: 2048, height: 2732 }, // iPad Pro 12.9"
];

// Screenshot placeholders
const screenshots = [
  { name: 'screenshot-wide.png', width: 1280, height: 720 },
  { name: 'screenshot-narrow.png', width: 720, height: 1280 },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons from icons/web...\n');
  
  await mkdir(outputDir, { recursive: true });

  // Generate all icon sizes
  console.log('📱 Generating app icons...');
  for (const config of iconSizes) {
    const sourcePath = config.src === 'maskable' ? maskableIcon : regularIcon;
    const outputPath = join(outputDir, config.name);
    
    await sharp(sourcePath)
      .resize(config.size, config.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${config.name}`);
  }

  // Generate splash screens
  console.log('\n🖼️  Generating splash screens...');
  for (const config of splashScreens) {
    const outputPath = join(outputDir, config.name);
    const iconSize = Math.min(config.width, config.height) * 0.25;
    
    const icon = await sharp(regularIcon)
      .resize(Math.round(iconSize), Math.round(iconSize), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();
    
    await sharp({
      create: {
        width: config.width,
        height: config.height,
        channels: 4,
        background: darkBackgroundColor
      }
    })
      .composite([{
        input: icon,
        top: Math.round((config.height - iconSize) / 2),
        left: Math.round((config.width - iconSize) / 2)
      }])
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${config.name}`);
  }

  // Generate screenshot placeholders
  console.log('\n📸 Generating screenshot placeholders...');
  for (const config of screenshots) {
    const outputPath = join(outputDir, config.name);
    const iconSize = Math.min(config.width, config.height) * 0.35;
    
    const icon = await sharp(regularIcon)
      .resize(Math.round(iconSize), Math.round(iconSize), {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();
    
    await sharp({
      create: {
        width: config.width,
        height: config.height,
        channels: 4,
        background: darkBackgroundColor
      }
    })
      .composite([{
        input: icon,
        top: Math.round((config.height - iconSize) / 2),
        left: Math.round((config.width - iconSize) / 2)
      }])
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${config.name}`);
  }

  // Copy favicon.ico to public root
  console.log('\n📄 Copying favicon...');
  await copyFile(favicon, join(publicDir, 'favicon.ico'));
  console.log('  ✓ favicon.ico');

  console.log('\n✅ All PWA icons generated successfully!');
  console.log(`\n📁 Output directory: ${outputDir}`);
}

generateIcons().catch(console.error);
