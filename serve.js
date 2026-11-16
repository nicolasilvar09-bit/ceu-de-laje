// Servidor local só pra testar o protótipo: node PipaPrototipo/serve.js  → http://localhost:5178
// POST /save?name=arquivo.glb grava em assets/web/ (usado pela convert.html); &dir=tex|tex/512|web/props escolhe outra pasta (compress.html)
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = 5178;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.fbx': 'application/octet-stream', '.json': 'application/json', '.mp4': 'video/mp4' };
http.createServer((req, res) => {
  const [p0, q] = req.url.split('?');
  if (req.method === 'POST' && p0 === '/save') {
    const name = new URLSearchParams(q).get('name') || '';
    if (!/^[\w.-]+\.(glb|jpg|png|json)$/.test(name)) { res.writeHead(400); return res.end('bad name'); }
    const chunks = []; req.on('data', c => chunks.push(c));
    req.on('end', () => { const sub = new URLSearchParams(q).get('dir') || 'web'; if (!['web','web/props','tex','tex/512'].includes(sub)) { res.writeHead(400); return res.end('bad dir'); } const dir = path.join(root, 'assets', ...sub.split('/')); fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, name), Buffer.concat(chunks)); res.end('ok ' + name); });
    return;
  }
  let p = decodeURIComponent(p0); if (p === '/') p = '/ceu-de-laje.html';
  const f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, () => console.log('Céu de Laje em http://localhost:' + port));
