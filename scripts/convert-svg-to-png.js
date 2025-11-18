const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function convertSvgToPng() {
  const svgFiles = [
    'legalese-logo.svg',
    'legalese-logo-modern.svg', 
    'legalese-linkedin-logo.svg'
  ];

  const sizes = {
    'legalese-logo.svg': { width: 800, height: 800 },
    'legalese-logo-modern.svg': { width: 800, height: 800 },
    'legalese-linkedin-logo.svg': { width: 400, height: 400 }
  };

  for (const svgFile of svgFiles) {
    try {
      const svgPath = path.join(__dirname, '..', 'public', svgFile);
      const svgBuffer = await fs.readFile(svgPath);
      
      // Create standard size PNG
      const pngFile = svgFile.replace('.svg', '.png');
      const pngPath = path.join(__dirname, '..', 'public', pngFile);
      const size = sizes[svgFile];
      
      await sharp(svgBuffer)
        .resize(size.width, size.height)
        .png()
        .toFile(pngPath);
      
      console.log(`✓ Created ${pngFile} (${size.width}x${size.height})`);
      
      // Create high-res version for LinkedIn (1200x1200)
      const hiResPngFile = svgFile.replace('.svg', '-hires.png');
      const hiResPngPath = path.join(__dirname, '..', 'public', hiResPngFile);
      
      await sharp(svgBuffer)
        .resize(1200, 1200)
        .png()
        .toFile(hiResPngPath);
      
      console.log(`✓ Created ${hiResPngFile} (1200x1200)`);
      
    } catch (error) {
      console.error(`Error converting ${svgFile}:`, error.message);
    }
  }
}

convertSvgToPng().catch(console.error);