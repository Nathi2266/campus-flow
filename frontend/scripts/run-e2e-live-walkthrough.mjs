/**
 * Live demo: ONE continuous walkthrough in a single headed Google Chrome window.
 * - Real-user pacing (slowMo + human pauses)
 * - Video always recorded + archived
 * - Optional 0.5× playback export via ffmpeg
 *
 * Watch the Chrome window that opens — do not close it until the run finishes.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')

const env = {
  ...process.env,
  E2E_LIVE: '1',
  E2E_HEADED: '1',
  E2E_CHANNEL: process.env.E2E_CHANNEL || 'chrome',
  // ~0.5× feel while recording (ms delay between Playwright actions)
  E2E_SLOW_MO: process.env.E2E_SLOW_MO || '500',
  E2E_HUMAN_PAUSE_MS: process.env.E2E_HUMAN_PAUSE_MS || '900',
  E2E_TYPE_DELAY_MS: process.env.E2E_TYPE_DELAY_MS || '40',
  E2E_BASE_URL: process.env.E2E_BASE_URL || 'http://localhost:5173',
}

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  CampusFlow LIVE walkthrough                                 ║
║  Browser: Google Chrome (single window, one continuous test) ║
║  Pace: slowMo=${env.E2E_SLOW_MO}ms · human pause=${env.E2E_HUMAN_PAUSE_MS}ms              ║
║  Watch the Chrome window — do not close it.                  ║
║  URL: ${env.E2E_BASE_URL.padEnd(48)}║
╚══════════════════════════════════════════════════════════════╝
`)

const pw = spawnSync(
  'npx',
  [
    'playwright',
    'test',
    'e2e/full-app-walkthrough.spec.ts',
    '--headed',
    '--workers=1',
    '--project=', // noop guard — config has no named projects; workers=1 enforced
  ].filter((a) => a !== '--project='),
  {
    cwd: frontendRoot,
    stdio: 'inherit',
    shell: true,
    env,
  },
)

const preserve = spawnSync(process.execPath, [path.join(__dirname, 'preserve-e2e-video.mjs')], {
  cwd: frontendRoot,
  stdio: 'inherit',
  env,
})

if (preserve.status !== 0) {
  console.warn(`preserve-e2e-video exited ${preserve.status}`)
}

const slow = spawnSync(process.execPath, [path.join(__dirname, 'slow-walkthrough-video.mjs')], {
  cwd: frontendRoot,
  stdio: 'inherit',
  env,
})

if (slow.status !== 0) {
  console.warn(`slow-walkthrough-video exited ${slow.status}`)
}

process.exit(pw.status ?? 1)
