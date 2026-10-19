const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// Prefer normal project dependencies. The desktop bundle is a convenient
// fallback on the machine where the original page was captured.
const bundled = path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
function dependency(name) {
  try { return require.resolve(name); } catch {}
  const candidate = path.join(process.env.BROWSER_TEST_MODULES || bundled, name);
  try { return require.resolve(candidate); } catch {}
  throw new Error(`Missing ${name}. Run npm install before browser verification.`);
}
function chromeExecutable(chromium) {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const installed = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return fs.existsSync(installed) ? installed : chromium.executablePath();
}
module.exports = { dependency, chromeExecutable };
