import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

function run(command, args, label) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  })

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${label}] exited with code ${code}`)
      process.exit(code)
    }
  })

  return child
}

console.log('Starting local functions server + Vite...\n')

const functions = run('node', ['scripts/local-functions-server.mjs'], 'functions')
const vite = run('node', ['node_modules/vite/bin/vite.js'], 'vite')

const shutdown = () => {
  functions.kill()
  vite.kill()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
