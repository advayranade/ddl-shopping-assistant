// Shared logging helper — matches the project-wide convention (flow, event, timestamp).
// Every agent flow emits structured JSON so traces are legible across all demos.
export function log(event: string, data?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    flow: 'shopping-agent',
    event,
    ...data,
  }
  console.log(JSON.stringify(entry))
}
