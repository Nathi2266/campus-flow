/**
 * Full E2E in a visible Chromium window (slow-mo) so operators can watch.
 * Always archives videos afterward.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const extraArgs = process.argv.slice(2)

const env = {
  ...process.env,
  E2E_HEADED: '1',
  E2E_SLOW_MO: process.env.E2E_SLOW_MO || '450',
}

console.log(
  `Opening headed Chromium (slowMo=${env.E2E_SLOW_MO}ms) against ${env.E2E_BASE_URL || 'http://localhost:5173'} — watch the Playwright window.`,
)

const pw = spawnSync('npx', ['playwright', 'test', '--headed', ...extraArgs], {
  cwd: frontendRoot,
  stdio: 'inherit',
  shell: true,
  env,
})

const preserve = spawnSync(process.execPath, [path.join(__dirname, 'preserve-e2e-video.mjs')], {
  cwd: frontendRoot,
  stdio: 'inherit',
  env,
})

if (preserve.status !== 0) {
  console.warn(`preserve-e2e-video exited ${preserve.status}`)
}

process.exit(pw.status ?? 1)
