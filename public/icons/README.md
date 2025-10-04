# PWA Icons

This directory contains the Progressive Web App icons for Family Task Scheduler.

## Required Sizes

The following icon sizes are required for PWA support:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Generating Icons

To generate icons from a source image, you can use tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Or use ImageMagick:

```bash
convert source.png -resize 72x72 icon-72x72.png
convert source.png -resize 96x96 icon-96x96.png
convert source.png -resize 128x128 icon-128x128.png
convert source.png -resize 144x144 icon-144x144.png
convert source.png -resize 152x152 icon-152x152.png
convert source.png -resize 192x192 icon-192x192.png
convert source.png -resize 384x384 icon-384x384.png
convert source.png -resize 512x512 icon-512x512.png
```

## Design Guidelines

- Use a simple, recognizable icon
- Ensure it works on both light and dark backgrounds
- Keep important elements centered (safe zone)
- Use the brand color (#2563eb - blue)
- Make it scalable and clear at all sizes
