/**
 * Archive ALL Playwright .webm recordings to e2e-artifacts/ (durable).
 * Playwright clears test-results/ on the next run — this folder is never auto-deleted.
 *
 * Outputs:
 * - e2e-artifacts/runs/<timestamp>/… individual clips + INDEX.md
 * - e2e-artifacts/campusflow-full-app-walkthrough.webm (latest continuous walkthrough)
 * - e2e-artifacts/README.md
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const resultsDir = path.join(frontendRoot, 'test-results')
const artifactsDir = path.join(frontendRoot, 'e2e-artifacts')

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

function slugFromPath(videoPath) {
  const parent = path.basename(path.dirname(videoPath))
  return parent
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'clip'
}

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

mkdirSync(artifactsDir, { recursive: true })

let videos = []
for (let attempt = 0; attempt < 25; attempt++) {
  videos = findVideos(resultsDir).filter((v) => statSync(v).size > 10_000)
  if (videos.length > 0) break
  await sleep(300)
}

if (videos.length === 0) {
  console.error('No Playwright .webm videos found under test-results/. Ensure video: "on".')
  process.exit(1)
}

const runId = stamp()
const runDir = path.join(artifactsDir, 'runs', runId)
mkdirSync(runDir, { recursive: true })

const indexRows = []
let walkthroughSource = null

for (const src of videos.sort((a, b) => a.localeCompare(b))) {
  const size = statSync(src).size
  const name = `${slugFromPath(src)}.webm`
  const dest = path.join(runDir, name)
  // Avoid collisions
  let finalDest = dest
  let i = 2
  while (existsSync(finalDest)) {
    finalDest = path.join(runDir, `${slugFromPath(src)}-${i}.webm`)
    i += 1
  }
  copyFileSync(src, finalDest)
  const mb = (size / (1024 * 1024)).toFixed(2)
  indexRows.push(`| \`${path.basename(finalDest)}\` | ${mb} MB | \`${path.relative(frontendRoot, src).replace(/\\/g, '/')}\` |`)
  if (/full-app-walkthrough/i.test(src) && (!walkthroughSource || size > statSync(walkthroughSource).size)) {
    walkthroughSource = src
  }
}

if (walkthroughSource && statSync(walkthroughSource).size > 1_000_000) {
  const hero = path.join(artifactsDir, 'campusflow-full-app-walkthrough.webm')
  copyFileSync(walkthroughSource, hero)
  console.log(
    `Updated hero walkthrough → ${hero} (${(statSync(hero).size / (1024 * 1024)).toFixed(2)} MB)`,
  )
} else if (walkthroughSource) {
  console.warn(
    `Skipped hero update — walkthrough clip too small (${(statSync(walkthroughSource).size / 1024).toFixed(0)} KB); likely a failed early exit.`,
  )
}

const indexBody = `# E2E recording run ${runId}

**When:** ${new Date().toISOString()}  
**Clips:** ${indexRows.length}  
**Folder:** \`e2e-artifacts/runs/${runId}/\`

Play any \`.webm\` in Chrome, Edge, or VLC. This archive is **never auto-deleted**.

| File | Size | Source |
|------|------|--------|
${indexRows.join('\n')}

## Continuous walkthrough

If present this run, also copied to:

\`e2e-artifacts/campusflow-full-app-walkthrough.webm\`
`

writeFileSync(path.join(runDir, 'INDEX.md'), indexBody, 'utf8')

writeFileSync(
  path.join(artifactsDir, 'README.md'),
  `# CampusFlow E2E artifacts (durable recordings)

Playwright may clear \`../test-results/\` on the next run.  
**Nothing in this folder is deleted automatically.**

## Latest continuous walkthrough

**\`campusflow-full-app-walkthrough.webm\`** — one long video of all roles & features.

## All clips from each run

See \`runs/<timestamp>/INDEX.md\` for every per-test recording.

### Latest run

\`${runId}\` — ${indexRows.length} clip(s)

### Regenerate

\`\`\`bash
cd frontend
npm run test:e2e:full
\`\`\`

Or walkthrough only:

\`\`\`bash
npm run test:e2e:walkthrough
\`\`\`
`,
  'utf8',
)

console.log(`Archived ${indexRows.length} video(s) → ${runDir}`)
console.log(`INDEX: ${path.join(runDir, 'INDEX.md')}`)
