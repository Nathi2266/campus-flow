/**
 * Copy the full-app walkthrough Playwright video to e2e-artifacts/.
 * Run AFTER playwright exits so the .webm is fully flushed to disk.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const resultsDir = path.join(frontendRoot, 'test-results')
const artifactsDir = path.join(frontendRoot, 'e2e-artifacts')
const outFile = path.join(artifactsDir, 'campusflow-full-app-walkthrough.webm')

function findVideos(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    let st
    try {
      st = statSync(full)
    } catch {
      continue
    }
    if (st.isDirectory()) findVideos(full, acc)
    else if (name.endsWith('.webm') && st.size > 0) acc.push(full)
  }
  return acc
}

mkdirSync(artifactsDir, { recursive: true })

let source
for (let attempt = 0; attempt < 20; attempt++) {
  const videos = findVideos(resultsDir)
  const walkthrough = videos.filter((v) => /full-app-walkthrough/i.test(v))
  source = walkthrough.sort((a, b) => statSync(b).size - statSync(a).size)[0]
  if (source && statSync(source).size > 50_000) break
  await sleep(300)
}

if (!source || statSync(source).size < 50_000) {
  console.error('No full-app-walkthrough .webm found. Run: npm run test:e2e:walkthrough')
  process.exit(1)
}

copyFileSync(source, outFile)
const mb = (statSync(outFile).size / (1024 * 1024)).toFixed(2)
writeFileSync(
  path.join(artifactsDir, 'README.md'),
  `# CampusFlow E2E artifacts

## Full walkthrough video (kept after test runs)

**File:** \`campusflow-full-app-walkthrough.webm\`  
**Updated:** ${new Date().toISOString()}  
**Size:** ${mb} MB  
**Source:** \`${path.relative(frontendRoot, source).replace(/\\\\/g, '/')}\`

Play in Chrome, Edge, or VLC. This folder is **not** cleared by Playwright.

Regenerate: \`npm run test:e2e:walkthrough\`
`,
  'utf8',
)
console.log(`Preserved walkthrough video → ${outFile} (${mb} MB)`)
