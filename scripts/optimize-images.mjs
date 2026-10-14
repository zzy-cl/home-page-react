#!/usr/bin/env node
import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, extname } from 'path'

const publicDir = 'public/images'
const quality = 80

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase()

  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    return
  }

  console.log(`优化: ${filePath}`)

  const input = await sharp(filePath)
  const metadata = await input.metadata()
  const outputPath = filePath.replace(/\.(jpe?g|png)$/i, '.webp')

  await input
    .webp({ quality, effort: 6 })
    .toFile(outputPath)

  const originalSize = (await stat(filePath)).size
  const optimizedSize = (await stat(outputPath)).size
  const saved = ((1 - optimizedSize / originalSize) * 100).toFixed(1)

  console.log(`  ${(originalSize / 1024).toFixed(1)} KB → ${(optimizedSize / 1024).toFixed(1)} KB (节省 ${saved}%)`)
}

async function walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      await walkDir(fullPath)
    } else if (entry.isFile()) {
      await optimizeImage(fullPath)
    }
  }
}

console.log('开始优化图片...\n')
await walkDir(publicDir)
console.log('\n✅ 优化完成!')
