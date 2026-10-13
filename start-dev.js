const { spawn } = require('child_process');
const path = require('path');

console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║   TCP Reliable File Transfer Simulation                        ║');
console.log('║   Starting Backend (port 5000) & Frontend (port 5173)...       ║');
╚════════════════════════════════════════════════════════════════╝');
console.log('');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
});

function cleanup() {
  console.log('\nStopping servers...');
  try { backend.kill(); } catch (_) {}
  try { frontend.kill(); } catch (_) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
