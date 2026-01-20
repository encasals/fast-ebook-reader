import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const iconsDir = join(__dirname, 'public', 'icons');
const svgPath = join(iconsDir, 'icon.svg');
const maskableSvgPath = join(iconsDir, 'maskable-icon.svg');

const sizes = [
  { name: 'icon-192x192.png', size: 192, src: 'regular' },
  { name: 'icon-512x512.png', size: 512, src: 'regular' },
  { name: 'maskable-icon-512x512.png', size: 512, src: 'maskable' },
  { name: 'apple-touch-icon.png', size: 180, src: 'regular' },
  { name: 'apple-splash-1125-2436.png', width: 1125, height: 2436 },
  { name: 'apple-splash-1170-2532.png', width: 1170, height: 2532 },
  { name: 'apple-splash-2048-2732.png', width: 2048, height: 2732 },
];

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  await mkdir(iconsDir, { recursive: true });

  for (const config of sizes) {
    const outputPath = join(iconsDir, config.name);
    const sourcePath = config.src === 'maskable' ? maskableSvgPath : svgPath;
    
    if (config.size) {
      // Square icons
      await sharp(sourcePath)
        .resize(config.size, config.size)
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${config.name}`);
    } else {
      // Splash screens - center the icon on a colored background
      const iconSize = Math.min(config.width, config.height) * 0.3;
      const icon = await sharp(svgPath)
        .resize(Math.round(iconSize), Math.round(iconSize))
        .toBuffer();
      
      await sharp({
        create: {
          width: config.width,
          height: config.height,
          channels: 4,
          background: { r: 26, g: 26, b: 46, alpha: 1 } // #1a1a2e
        }
      })
        .composite([{
          input: icon,
          top: Math.round((config.height - iconSize) / 2),
          left: Math.round((config.width - iconSize) / 2)
        }])
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated ${config.name}`);
    }
  }
  
  // Generate screenshot placeholders
  const screenshotSizes = [
    { name: 'screenshot-wide.png', width: 1280, height: 720 },
    { name: 'screenshot-narrow.png', width: 720, height: 1280 },
  ];
  
  for (const config of screenshotSizes) {
    const outputPath = join(iconsDir, config.name);
    const iconSize = Math.min(config.width, config.height) * 0.4;
    const icon = await sharp(svgPath)
      .resize(Math.round(iconSize), Math.round(iconSize))
      .toBuffer();
    
    await sharp({
      create: {
        width: config.width,
        height: config.height,
        channels: 4,
        background: { r: 26, g: 26, b: 46, alpha: 1 }
      }
    })
      .composite([{
        input: icon,
        top: Math.round((config.height - iconSize) / 2),
        left: Math.round((config.width - iconSize) / 2)
      }])
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated ${config.name}`);
  }

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
