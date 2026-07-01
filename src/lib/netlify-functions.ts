/**
 * Netlify Functions URL helper.
 * When Vite runs alone on :8766, functions live on Netlify Dev (:8765).
 * Prefer opening http://localhost:8765 (npm run dev) for the full stack.
 */
export function netlifyFunctionUrl(functionName: string): string {
  if (
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    window.location.port === '8766'
  ) {
    return `http://localhost:8765/.netlify/functions/${functionName}`
  }
  return `/.netlify/functions/${functionName}`
}
