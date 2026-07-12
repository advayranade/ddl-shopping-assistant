import fs from 'fs'
import path from 'path'

// Shared logging helper — matches the project-wide convention (flow, event, timestamp).
// Every agent flow emits structured JSON so traces are legible across all demos.
// Logs go to both stdout (visible in the `next dev` terminal) and a rolling
// logs/agent.log file for offline inspection.

const LOG_DIR = path.join(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'agent.log')

let logDirReady = false
function ensureLogDir() {
  if (logDirReady) return
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true })
    logDirReady = true
  } catch {
    // Read-only filesystem (e.g. serverless prod) — fall back to console-only.
  }
}

export function log(event: string, data?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    flow: 'shopping-agent',
    event,
    ...data,
  }
  const line = JSON.stringify(entry)
  console.log(line)

  ensureLogDir()
  if (logDirReady) {
    try {
      fs.appendFileSync(LOG_FILE, line + '\n')
    } catch {
      // ignore write errors
    }
  }
}
