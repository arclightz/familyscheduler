/**
 * Generate placeholder PWA icons
 *
 * Creates simple SVG-based placeholder icons for PWA.
 * In production, replace with actual designed icons.
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach((size) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.15}"/>

  <!-- Calendar icon -->
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <!-- Calendar body -->
    <rect x="0" y="${size * 0.1}" width="${size * 0.6}" height="${size * 0.5}" fill="white" rx="${size * 0.05}"/>

    <!-- Calendar header -->
    <rect x="0" y="${size * 0.1}" width="${size * 0.6}" height="${size * 0.12}" fill="#dbeafe" rx="${size * 0.05}"/>

    <!-- Calendar rings -->
    <rect x="${size * 0.12}" y="${size * 0.05}" width="${size * 0.06}" height="${size * 0.12}" fill="white" rx="${size * 0.02}"/>
    <rect x="${size * 0.42}" y="${size * 0.05}" width="${size * 0.06}" height="${size * 0.12}" fill="white" rx="${size * 0.02}"/>

    <!-- Checkmark -->
    <g transform="translate(${size * 0.15}, ${size * 0.3})">
      <path d="M 0 ${size * 0.1} L ${size * 0.08} ${size * 0.18} L ${size * 0.22} ${size * 0.02}"
            stroke="#2563eb"
            stroke-width="${size * 0.04}"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    </g>
  </g>
</svg>`;

  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;

  // Save SVG
  fs.writeFileSync(path.join(iconsDir, svgFilename), svg);

  console.log(`Generated ${svgFilename}`);
});

console.log('\nSVG icons generated successfully!');
console.log('To convert to PNG, use ImageMagick or an online converter.');
console.log('For production, replace with professionally designed icons.');
