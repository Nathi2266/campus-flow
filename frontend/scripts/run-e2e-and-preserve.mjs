/**
 * Run Playwright then always archive videos (even on failure).
 * Exit code mirrors Playwright.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const args = process.argv.slice(2)

const pw = spawnSync('npx', ['playwright', 'test', ...args], {
  cwd: frontendRoot,
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

const preserve = spawnSync(process.execPath, [path.join(__dirname, 'preserve-e2e-video.mjs')], {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: process.env,
})

if (preserve.status !== 0) {
  console.warn(`preserve-e2e-video exited ${preserve.status}`)
}

process.exit(pw.status ?? 1)
