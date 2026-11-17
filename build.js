// Gera index.html (página completa para GitHub Pages) a partir de ceu-de-laje.html.
// Uso: node build.js
'use strict';
const fs = require('fs');
const path = require('path');

const root = __dirname;
const sourcePath = path.join(root, 'ceu-de-laje.html');
const outputPath = path.join(root, 'index.html');
if (!fs.existsSync(sourcePath)) throw new Error('Fonte não encontrada: ceu-de-laje.html');
const src = fs.readFileSync(sourcePath, 'utf8');

const out = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#173b4b">
<meta name="description" content="Céu de Laje: jogo de pipa em mundo aberto. Solte sua pipa, cruze linhas, dispute o céu e explore a cidade.">
<meta name="application-name" content="Céu de Laje">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Céu de Laje">
<meta name="format-detection" content="telephone=no">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="icon" type="image/png" sizes="32x32" href="assets/web/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/web/icon-192.png">
<link rel="apple-touch-icon" href="assets/web/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
</head>
<body>
${src}
</body>
</html>
`;
const tempPath = outputPath + '.tmp';
fs.writeFileSync(tempPath, out, 'utf8');
fs.renameSync(tempPath, outputPath);
console.log(`index.html gerado (${(Buffer.byteLength(out) / 1024).toFixed(0)} KB)`);
