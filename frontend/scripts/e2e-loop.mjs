#!/usr/bin/env node
/**
 * AEOS E2E test loop — run Playwright, write council failure report, retry.
 * Usage: node scripts/e2e-loop.mjs
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')
const maxRetries = Number(process.env.E2E_MAX_RETRIES || 3)
const reportPath = path.resolve(frontendRoot, '../.kiro/memory/e2e-failure-report.md')

function runE2E(attempt) {
  console.log(`\n=== AEOS E2E Loop attempt ${attempt}/${maxRetries} ===\n`)
  const result = spawnSync('npx', ['playwright', 'test'], {
    cwd: frontendRoot,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  })
  return result.status === 0
}

function readReport() {
  try {
    return fs.readFileSync(reportPath, 'utf8')
  } catch {
    return '(no report file yet)'
  }
}

let attempt = 1
let passed = false

while (attempt <= maxRetries) {
  passed = runE2E(attempt)
  if (passed) {
    console.log('\n✓ E2E loop GREEN — Loop Engineer may sign off.\n')
    process.exit(0)
  }

  console.log('\n✗ E2E failed — council failure report:\n')
  console.log(readReport())
  console.log(
    '\nLoop Engineer: assign engineer from report, fix, then re-run.\n' +
      'This script retries automatically; set E2E_MAX_RETRIES to change limit.\n',
  )

  if (attempt === maxRetries) break
  attempt += 1
  // Brief pause for hot-reload / docker restart after agent fixes
  spawnSync(process.platform === 'win32' ? 'timeout' : 'sleep', process.platform === 'win32' ? ['/t', '3', '/nobreak'] : ['3'], {
    shell: true,
    stdio: 'ignore',
  })
}

console.error(`\nE2E loop exhausted after ${maxRetries} attempts. See ${reportPath}\n`)
process.exit(1)
