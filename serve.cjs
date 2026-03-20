#!/usr/bin/env node
// Local dev server for rewardz-boardroom.html
// Serves the mini app and proxies structured board prompts through local Codex CLI.

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { buildRespondPrompt, loadBuiltinMembers, renderMinutesMarkdown } = require('./boardroom/server-helpers.cjs');

const DEFAULT_PORT = Number.parseInt(process.env.PORT || '3737', 10);
const MINUTES_DIR = path.join(__dirname, 'board-minutes');
const minutesFiles = new Map();
const STATIC_ROOT = path.join(__dirname, 'boardroom');

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
  const parts = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')];
  const time = [String(date.getHours()).padStart(2, '0'), String(date.getMinutes()).padStart(2, '0'), String(date.getSeconds()).padStart(2, '0')];
  return `${parts.join('-')}_${time.join('-')}`;
}

function getMinutesFilePath(sessionId, summary) {
  if (minutesFiles.has(sessionId)) return minutesFiles.get(sessionId);
  const filePath = path.join(MINUTES_DIR, `${timestampForFilename()}_${slugify(summary)}.md`);
  minutesFiles.set(sessionId, filePath);
  return filePath;
}

function parseJsonBody(req, callback) {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    try {
      callback(null, JSON.parse(body || '{}'));
    } catch (error) {
      callback(error);
    }
  });
}

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function mimeType(filePath) {
  if (filePath.endsWith('.js')) return 'text/javascript';
  if (filePath.endsWith('.json')) return 'application/json';
  if (filePath.endsWith('.html')) return 'text/html';
  return 'text/plain';
}

function runCodex(prompt, callback) {
  const outputFile = path.join(os.tmpdir(), `rewardz-codex-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`);
  const child = spawn('codex', [
    'exec',
    '--ephemeral',
    '--skip-git-repo-check',
    '--sandbox', 'read-only',
    '--color', 'never',
    '-o', outputFile,
    '-',
  ], {
    cwd: process.cwd(),
    env: { ...process.env, NO_COLOR: '1', OTEL_SDK_DISABLED: 'true' },
  });

  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', (error) => callback(error));
  child.on('close', (code) => {
    fs.readFile(outputFile, 'utf8', (readError, content) => {
      fs.unlink(outputFile, () => {});
      if (code !== 0) return callback(new Error(stderr.trim() || `codex exited with status ${code}`));
      if (readError) return callback(readError);
      return callback(null, content.trim());
    });
  });
  child.stdin.end(prompt);
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/api/bootstrap') {
    return json(res, 200, { builtinMembers: loadBuiltinMembers() });
  }

  if (req.method === 'POST' && req.url === '/api/respond') {
    return parseJsonBody(req, (error, payload) => {
      if (error) return json(res, 400, { error: `Invalid JSON: ${error.message}` });
      if (!payload.member || !payload.userText) return json(res, 400, { error: 'Missing member or userText.' });

      const prompt = buildRespondPrompt(payload);
      return runCodex(prompt, (codexError, content) => {
        if (codexError) return json(res, 502, { error: codexError.message });
        return json(res, 200, { content });
      });
    });
  }

  if (req.method === 'POST' && req.url === '/api/minutes') {
    return parseJsonBody(req, (error, payload) => {
      if (error) return json(res, 400, { error: `Invalid JSON: ${error.message}` });
      if (!payload.sessionId || typeof payload.sessionId !== 'string') return json(res, 400, { error: 'Missing sessionId string.' });
      if (!payload.session || typeof payload.session !== 'object') return json(res, 400, { error: 'Missing session object.' });

      return ensureMinutesDir((dirError) => {
        if (dirError) return json(res, 500, { error: dirError.message });
        const filePath = getMinutesFilePath(payload.sessionId, payload.summary);
        const markdown = renderMinutesMarkdown(payload.session, payload.summary || 'board-session', payload.sessionId);
        return fs.writeFile(filePath, markdown, 'utf8', (writeError) => {
          if (writeError) return json(res, 500, { error: writeError.message });
          return json(res, 200, { ok: true, filePath: path.relative(process.cwd(), filePath) });
        });
      });
    });
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const file = path.join(__dirname, 'rewardz-boardroom.html');
    return fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(data);
    });
  }

  if (req.method === 'GET' && req.url.startsWith('/boardroom/')) {
    const file = path.join(STATIC_ROOT, req.url.replace('/boardroom/', ''));
    return fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404);
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': mimeType(file) });
      return res.end(data);
    });
  }

  res.writeHead(404);
  res.end('Not found');
});

function startServer(port) {
  server.listen(port, () => {
    console.log(`Rewardz Board running -> http://localhost:${port}`);
  });
}

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    currentPort += 1;
    console.warn(`Port in use, retrying on ${currentPort}...`);
    setTimeout(() => startServer(currentPort), 50);
    return;
  }
  throw error;
});

let currentPort = DEFAULT_PORT;
startServer(currentPort);
