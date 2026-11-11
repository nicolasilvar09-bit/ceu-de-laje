// Gera index.html (página completa, pra GitHub Pages) a partir de ceu-de-laje.html (fonte do artifact, sem <html>/<head>).
// Uso: node build.js
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'ceu-de-laje.html'), 'utf8');
const out = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1f6fc7">
<link rel="icon" type="image/png" sizes="32x32" href="assets/web/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/web/icon-192.png">
<link rel="apple-touch-icon" href="assets/web/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Céu de Laje">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
</head>
<body>
${src}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'index.html'), out);
console.log('index.html gerado (' + (out.length / 1024).toFixed(0) + ' KB)');
