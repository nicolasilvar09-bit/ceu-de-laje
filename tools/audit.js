#!/usr/bin/env node
// Auditoria estática sem dependências externas: node tools/audit.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const fail = [];
const pass = [];
const check = (condition, message) => (condition ? pass : fail).push(message);

const sourcePath = path.join(root, 'ceu-de-laje.html');
const indexPath = path.join(root, 'index.html');
const html = fs.readFileSync(sourcePath, 'utf8');

// Sintaxe de todos os scripts inline (bibliotecas CDN externas são verificadas à parte).
const scriptTags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
let inlineCount = 0;
for (const [i, match] of scriptTags.entries()) {
  if (/\bsrc\s*=/.test(match[1])) continue;
  const code = match[2].trim();
  if (!code) continue;
  inlineCount++;
  try { new vm.Script(code, { filename: `ceu-de-laje.html:inline-script-${i}` }); }
  catch (err) { fail.push(`JavaScript inline ${i}: ${err.message}`); }
}
check(inlineCount > 0, `${inlineCount} scripts inline analisados`);

// IDs HTML únicos e seletores estáticos do helper $() existentes.
const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]);
const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
check(duplicates.length === 0, duplicates.length ? `IDs duplicados: ${duplicates.join(', ')}` : `${ids.length} IDs HTML sem duplicidade`);
const idSet = new Set(ids);
const selectors = [...new Set([...html.matchAll(/\$\('#([^']+)'\)/g)].map(m => m[1]))];
const missing = selectors.filter(id => !idSet.has(id));
check(missing.length === 0, missing.length ? `Seletores sem elemento: ${missing.join(', ')}` : `${selectors.length} seletores estáticos encontrados no HTML`);

// Todos os documentos glTF JSON devem ser válidos e seus buffers/imagens locais devem existir.
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const gltfFiles = walk(path.join(root, 'assets')).filter(f => f.endsWith('.gltf.json'));
let gltfErrors = 0;
for (const file of gltfFiles) {
  try {
    const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const section of ['buffers', 'images']) for (const item of (doc[section] || [])) {
      const uri = item.uri;
      if (!uri || uri.startsWith('data:')) continue;
      const target = path.resolve(path.dirname(file), decodeURIComponent(uri));
      if (!target.startsWith(path.resolve(root) + path.sep) || !fs.existsSync(target)) {
        gltfErrors++;
        fail.push(`Referência glTF ausente/insegura: ${path.relative(root, file)} -> ${uri}`);
      }
    }
  } catch (err) {
    gltfErrors++;
    fail.push(`glTF inválido: ${path.relative(root, file)} (${err.message})`);
  }
}
check(gltfFiles.length > 0 && gltfErrors === 0, `${gltfFiles.length} arquivos glTF JSON válidos; buffers e imagens conferidos`);

// Arquivos críticos do app e do PWA.
for (const rel of ['assets/web/sky.jpg', 'assets/web/favicon-32.png', 'assets/web/icon-192.png', 'assets/web/icon-512.png', 'assets/web/apple-touch-icon.png', 'assets/tex', 'assets/tex/512']) {
  check(fs.existsSync(path.join(root, rel)), `Arquivo/pasta presente: ${rel}`);
}
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons || []) check(fs.existsSync(path.join(root, icon.src)), `Ícone do manifesto presente: ${icon.src}`);

// O index precisa ser uma compilação da fonte atual.
const index = fs.readFileSync(indexPath, 'utf8');
check(index.includes(html), 'index.html contém a versão atual da fonte');
check(index.startsWith('<!doctype html>') && index.includes('<html lang="pt-BR">'), 'index.html tem documento completo em pt-BR');

// Regressões de segurança cobertas pela auditoria.
check(html.includes('copySafe') && html.includes("node.tagName==='EM'"), 'feed limita a marcação permitida e remove atributos perigosos');
check(html.includes('function cleanNick') && html.includes('function validVec3') && html.includes('function hostMessage'), 'apelidos, vetores e eventos de host possuem validação');
check(fs.readFileSync(path.join(root, 'serve.js'), 'utf8').includes('path.relative'), 'servidor usa validação de caminho por path.relative');

console.log('\nAUDITORIA ESTÁTICA — CÉU DE LAJE');
for (const item of pass) console.log(`OK   ${item}`);
for (const item of fail) console.error(`ERRO ${item}`);
console.log(`\nResultado: ${pass.length} verificações aprovadas; ${fail.length} falhas.`);
if (fail.length) process.exit(1);
