#!/usr/bin/env node
// Local dev server for rewardz-boardroom.html
// Serves the HTML and proxies /api/codex -> local Codex CLI (uses local ChatGPT login)

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const DEFAULT_PORT = Number.parseInt(process.env.PORT || '3737', 10);
const MINUTES_DIR = path.join(__dirname, 'board-minutes');
const minutesFiles = new Map();

function ensureMinutesDir(callback) {
  fs.mkdir(MINUTES_DIR, { recursive: true }, callback);
}

function slugify(value) {
  return String(value || 'board-session')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'board-session';
}

function timestampForFilename(date = new Date()) {
  const parts = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ];
  const time = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ];
  return `${parts.join('-')}_${time.join('-')}`;
}

function getMinutesFilePath(sessionId, summary) {
  if (minutesFiles.has(sessionId)) {
    return minutesFiles.get(sessionId);
  }

  const filePath = path.join(MINUTES_DIR, `${timestampForFilename()}_${slugify(summary)}.md`);
  minutesFiles.set(sessionId, filePath);
  return filePath;
}

function runCodex(prompt, callback) {
  const outputFile = path.join(os.tmpdir(), `rewardz-codex-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`);
  const args = [
    'exec',
    '--ephemeral',
    '--skip-git-repo-check',
    '--sandbox',
    'read-only',
    '--color',
    'never',
    '-o',
    outputFile,
    '-',
  ];

  const child = spawn('codex', args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NO_COLOR: '1',
      OTEL_SDK_DISABLED: 'true',
    },
  });

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  child.on('error', (err) => {
    callback(err);
  });

  child.on('close', (code) => {
    fs.readFile(outputFile, 'utf8', (readErr, content) => {
      fs.unlink(outputFile, () => {});

      if (code !== 0) {
        return callback(new Error(stderr.trim() || `codex exited with status ${code}`));
      }

      if (readErr) {
        return callback(readErr);
      }

      return callback(null, content.trim());
    });
  });

  child.stdin.end(prompt);
}

const server = http.createServer((req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Proxy to local Codex CLI
  if (req.method === 'POST' && req.url === '/api/codex') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: `Invalid JSON: ${err.message}` }));
      }

      if (!payload.prompt || typeof payload.prompt !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing prompt string.' }));
      }

      runCodex(payload.prompt, (err, content) => {
        if (err) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: err.message }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ content }));
      });
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/minutes') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: `Invalid JSON: ${err.message}` }));
      }

      const { sessionId, summary, content } = payload;
      if (!sessionId || typeof sessionId !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing sessionId string.' }));
      }
      if (!content || typeof content !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Missing content string.' }));
      }

      ensureMinutesDir((dirErr) => {
        if (dirErr) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: dirErr.message }));
        }

        const filePath = getMinutesFilePath(sessionId, summary);
        fs.writeFile(filePath, content, 'utf8', (writeErr) => {
          if (writeErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: writeErr.message }));
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            ok: true,
            filePath: path.relative(process.cwd(), filePath),
          }));
        });
      });
    });
    return;
  }

  // Serve the HTML file
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const file = path.join(__dirname, 'rewardz-boardroom.html');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`Rewardz Board running → http://localhost:${port}`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = (server.address() && typeof server.address() === 'object')
      ? server.address().port + 1
      : Number.isFinite(currentPort)
        ? currentPort + 1
        : DEFAULT_PORT + 1;
    currentPort = nextPort;
    console.warn(`Port in use, retrying on ${currentPort}...`);
    setTimeout(() => startServer(currentPort), 50);
    return;
  }

  throw err;
});

let currentPort = DEFAULT_PORT;
startServer(currentPort);
