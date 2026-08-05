/**
 * Create a 0.5× playback copy of the hero walkthrough (setpts=2.0*PTS).
 * Prefers ffmpeg-static (devDependency), falls back to system ffmpeg.
 */
import { createRequire } from 'node:module'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const artifactsDir = path.resolve(__dirname, '..', 'e2e-artifacts')
const input = path.join(artifactsDir, 'campusflow-full-app-walkthrough.webm')
const output = path.join(artifactsDir, 'campusflow-full-app-walkthrough-0.5x.webm')

function resolveFfmpeg() {
  try {
    const staticPath = require('ffmpeg-static')
    if (staticPath && existsSync(staticPath)) return staticPath
  } catch {
    /* optional */
  }
  return 'ffmpeg'
}

if (!existsSync(input) || statSync(input).size < 100_000) {
  console.warn('No hero walkthrough to slow down — skip 0.5× export.')
  process.exit(0)
}

const bin = resolveFfmpeg()
console.log(`Exporting 0.5× playback with ${bin} …`)

// Fast VP8 encode — good enough for review playback
const args = [
  '-y',
  '-i',
  input,
  '-filter:v',
  'setpts=2.0*PTS',
  '-an',
  '-c:v',
  'libvpx',
  '-b:v',
  '1M',
  '-deadline',
  'realtime',
  '-cpu-used',
  '8',
  output,
]

const ffmpeg = spawnSync(bin, args, { encoding: 'utf8' })

if (ffmpeg.error || ffmpeg.status !== 0) {
  console.warn('Could not export 0.5× video.')
  if (ffmpeg.stderr) console.warn(String(ffmpeg.stderr).slice(-1200))
  process.exit(0)
}

console.log(
  `0.5× playback video → ${output} (${(statSync(output).size / (1024 * 1024)).toFixed(2)} MB)`,
)
