import { spawn } from 'bun';

console.log('🚀 Starting development servers...\n');

// Start Vite frontend on port 5000 first (bind to 0.0.0.0 for external access)
const frontend = spawn([
  'bunx',
  'vite',
  '--port', '5000',
  '--host', '0.0.0.0',
  '--strictPort'
], {
  stdout: 'inherit',
  stderr: 'inherit',
  env: {
    ...process.env,
  },
});

// Give Vite a moment to start
await Bun.sleep(1000);

// Start ElysiaJS backend on port 3001
const backend = spawn(['bun', 'run', 'server/index.ts'], {
  stdout: 'inherit',
  stderr: 'inherit',
  env: { ...process.env },
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down servers...');
  frontend.kill();
  backend.kill();
  process.exit(0);
});

// Keep the process alive
await Promise.all([frontend.exited, backend.exited]);
