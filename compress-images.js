import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compressImages() {
  const publicDir = path.join(__dirname, 'public');
  const screenshotsDir = path.join(publicDir, 'screenshots');
  
  // Liste des images à compresser
  const images = [
    { input: path.join(publicDir, 'logo.png'), output: path.join(publicDir, 'logo.webp') },
    { input: path.join(publicDir, 'favicon.png'), output: path.join(publicDir, 'favicon.webp') },
    { input: path.join(screenshotsDir, 'stats.png'), output: path.join(screenshotsDir, 'stats.webp') },
    { input: path.join(screenshotsDir, '852shots_so.png'), output: path.join(screenshotsDir, '852shots_so.webp') },
    { input: path.join(screenshotsDir, '141shots_so.png'), output: path.join(screenshotsDir, '141shots_so.webp') },
    { input: path.join(screenshotsDir, 'vivier.png'), output: path.join(screenshotsDir, 'vivier.webp') },
    { input: path.join(screenshotsDir, 'Jobs.png'), output: path.join(screenshotsDir, 'Jobs.webp') },
    { input: path.join(screenshotsDir, '462shots_so.png'), output: path.join(screenshotsDir, '462shots_so.webp') }
  ];

  console.log('🖼️  Compression des images en WebP...\n');

  for (const image of images) {
    try {
      if (fs.existsSync(image.input)) {
        const originalSize = fs.statSync(image.input).size;
        
        await sharp(image.input)
          .webp({ quality: 80, effort: 6 })
          .toFile(image.output);
        
        const compressedSize = fs.statSync(image.output).size;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ ${path.basename(image.input)} → ${path.basename(image.output)}`);
        console.log(`   ${(originalSize / 1024).toFixed(1)} Ko → ${(compressedSize / 1024).toFixed(1)} Ko (-${reduction}%)\n`);
      } else {
        console.log(`⚠️  Fichier non trouvé: ${image.input}`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la compression de ${image.input}:`, error.message);
    }
  }

  console.log('🎉 Compression terminée !');
}

compressImages().catch(console.error);
