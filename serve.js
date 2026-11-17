// Servidor local de desenvolvimento do Céu de Laje.
// Uso: node serve.js  -> http://127.0.0.1:5178
// POST /save?name=arquivo.glb grava em assets/web/ (ou diretórios permitidos).
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = __dirname;
const port = Number(process.env.PORT) || 5178;
const host = process.env.HOST || '127.0.0.1';
const MAX_UPLOAD = 50 * 1024 * 1024;
const allowedDirs = new Set(['web', 'web/props', 'tex', 'tex/512']);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.fbx': 'application/octet-stream',
  '.mp4': 'video/mp4'
};

function isInside(base, target) {
  const rel = path.relative(base, target);
  return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel));
}

function send(res, status, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

async function serveFile(req, res, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch (_) { return send(res, 400, 'caminho inválido'); }
  if (decoded.includes('\0')) return send(res, 400, 'caminho inválido');
  if (decoded === '/') decoded = '/index.html';
  const target = path.resolve(root, '.' + decoded);
  if (!isInside(root, target)) return send(res, 403, 'acesso negado');

  try {
    const realRoot = await fs.promises.realpath(root);
    const realTarget = await fs.promises.realpath(target);
    if (!isInside(realRoot, realTarget)) return send(res, 403, 'acesso negado');
    const stat = await fs.promises.stat(realTarget);
    if (!stat.isFile()) return send(res, 404, '404');
    const headers = { 'Content-Length': stat.size, 'Content-Type': types[path.extname(realTarget).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (req.method === 'HEAD') { res.writeHead(200, headers); return res.end(); }
    const data = await fs.promises.readFile(realTarget);
    res.writeHead(200, headers);
    res.end(data);
  } catch (err) {
    send(res, err.code === 'ENOENT' ? 404 : 500, err.code === 'ENOENT' ? '404' : 'erro ao ler arquivo');
  }
}

async function saveUpload(req, res, url) {
  const name = url.searchParams.get('name') || '';
  const sub = url.searchParams.get('dir') || 'web';
  if (!/^[\w.-]+\.(glb|jpg|jpeg|png|webp|json)$/i.test(name) || name === '.' || name === '..') return send(res, 400, 'nome de arquivo inválido');
  if (!allowedDirs.has(sub)) return send(res, 400, 'diretório não permitido');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_UPLOAD) { send(res, 413, 'arquivo maior que 50 MB'); req.destroy(); return; }
    chunks.push(chunk);
  }
  const dir = path.resolve(root, 'assets', ...sub.split('/'));
  if (!isInside(path.join(root, 'assets'), dir)) return send(res, 403, 'diretório inválido');
  try {
    await fs.promises.mkdir(dir, { recursive: true });
    const realDir = await fs.promises.realpath(dir);
    if (!isInside(await fs.promises.realpath(path.join(root, 'assets')), realDir)) return send(res, 403, 'diretório inválido');
    const target = path.join(realDir, name);
    const temp = path.join(realDir, `.${name}.${process.pid}.tmp`);
    await fs.promises.writeFile(temp, Buffer.concat(chunks), { flag: 'w' });
    await fs.promises.rename(temp, target);
    send(res, 200, 'ok ' + name);
  } catch (_) {
    send(res, 500, 'não foi possível salvar o arquivo');
  }
}

// Gera o index.html antes de servir, evitando testar uma versão desatualizada da fonte.
try { execFileSync(process.execPath, [path.join(root, 'build.js')], { stdio: 'ignore' }); }
catch (err) { console.error('Falha ao gerar index.html:', err.message); process.exitCode = 1; }

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, `http://${req.headers.host || 'localhost'}`); }
  catch (_) { return send(res, 400, 'requisição inválida'); }
  if (req.method === 'POST' && url.pathname === '/save') return saveUpload(req, res, url);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'método não permitido');
  return serveFile(req, res, url.pathname);
});

server.listen(port, host, () => console.log(`Céu de Laje em http://${host}:${port}`));
