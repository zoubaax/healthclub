import { copyFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const distDir = join(__dirname, '..', 'dist')
const indexHtml = join(distDir, 'index.html')
const notFoundHtml = join(distDir, '404.html')

try {
  copyFileSync(indexHtml, notFoundHtml)
  console.log('✅ Copied index.html to 404.html for GitHub Pages SPA routing')
} catch (error) {
  console.error('❌ Error copying 404.html:', error.message)
  process.exit(1)
}

