/**
 * Fail if git-tracked paths look like secrets (.env, certs, Azure local, cred dumps).
 * Run from repo root: node scripts/verify-no-secrets.mjs
 */
import { execSync } from 'node:child_process'

const ALLOW = new Set([
  'docker/.env.example',
  // documented examples only — never real .env
])

const FORBIDDEN = [
  /(^|\/)\.env$/i,
  /(^|\/)\.env\.[^/]+$/i,
  /(^|\/)creds$/i,
  /(^|\/)credentials(\.|$)/i,
  /credentials.*\.json$/i,
  /serviceAccount.*\.json$/i,
  /google-services\.json$/i,
  /GoogleService-Info\.plist$/i,
  /\.(pem|key|p12|pfx|jks|keystore|crt|cer|der|p8|ppk|publishsettings)$/i,
  /(^|\/)id_(rsa|ed25519|ecdsa)(\.pub)?$/i,
  /(^|\/)local\.settings\.json$/i,
  /appsettings\..*\.local\.json$/i,
  /application-local\.(yml|yaml|properties)$/i,
  /application-secret\.(yml|yaml|properties)$/i,
  /(^|\/)\.azure\//i,
  /(^|\/)secrets\//i,
  /\.azurePubxml$/i,
  /\.pubxml\.user$/i,
]

function trackedFiles() {
  const out = execSync('git ls-files -z', { encoding: 'buffer' })
  return out
    .toString('utf8')
    .split('\0')
    .map((s) => s.trim())
    .filter(Boolean)
}

const hits = []
for (const file of trackedFiles()) {
  if (ALLOW.has(file)) continue
  // allow *.example env templates
  if (/(^|\/)\.env\.example$/i.test(file)) continue
  if (FORBIDDEN.some((re) => re.test(file))) hits.push(file)
}

if (hits.length) {
  console.error('Secret-like paths are tracked by git (untrack + add to .gitignore):')
  for (const h of hits) console.error(`  - ${h}`)
  process.exit(1)
}

console.log('OK: no secret-like paths in git index.')
