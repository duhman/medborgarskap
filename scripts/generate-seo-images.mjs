import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FAF7F1"/>
  <rect x="80" y="520" width="200" height="4" fill="#2d4a3e"/>
  <text x="80" y="200" font-family="system-ui, sans-serif" font-size="72" font-weight="600" fill="#211D18">Medborgarskap</text>
  <text x="80" y="280" font-family="system-ui, sans-serif" font-size="32" fill="#211D18" opacity="0.85">Fristående övning baserad på UHR:s Sverige i fokus</text>
  <text x="80" y="340" font-family="ui-monospace, monospace" font-size="22" fill="#2d4a3e" letter-spacing="2">medborgarskap.adrianmarten.net</text>
</svg>`

const appleSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#FAF7F1"/>
  <rect x="24" y="24" width="132" height="132" rx="2" fill="#2d4a3e"/>
  <text x="90" y="108" text-anchor="middle" font-family="system-ui, sans-serif" font-size="72" font-weight="600" fill="#FAF7F1">M</text>
</svg>`

await sharp(Buffer.from(ogSvg)).png().toFile(join(publicDir, 'og-image.png'))
await sharp(Buffer.from(appleSvg)).png().toFile(join(publicDir, 'apple-touch-icon.png'))

console.log('Wrote og-image.png, apple-touch-icon.png')
