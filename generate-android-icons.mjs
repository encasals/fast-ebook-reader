import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconSvg = join(__dirname, 'public/icons/icon.svg');
const maskableSvg = join(__dirname, 'public/icons/maskable-icon.svg');
const resDir = join(__dirname, 'android/app/src/main/res');

const sizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192
};

async function generate() {
  console.log('Generating Android launcher icons...');
  
  for (const [density, size] of Object.entries(sizes)) {
    const folder = join(resDir, `mipmap-${density}`);
    
    // Regular icon
    await sharp(iconSvg)
      .resize(size, size)
      .png()
      .toFile(join(folder, 'ic_launcher.png'));
    
    // Round icon
    await sharp(iconSvg)
      .resize(size, size)
      .png()
      .toFile(join(folder, 'ic_launcher_round.png'));
    
    // Foreground for adaptive icon
    await sharp(maskableSvg)
      .resize(size, size)
      .png()
      .toFile(join(folder, 'ic_launcher_foreground.png'));
    
    console.log(`✓ Generated ${density} icons (${size}x${size})`);
  }
  
  console.log('✅ All Android icons generated!');
}

generate();
