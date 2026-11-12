// Tiny static server for the web build. Usage: node tests/e2e/serve.js <folder>
// <folder> comes from: npx expo export --platform web --output-dir <folder>
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const types = { '.js': 'application/javascript', '.html': 'text/html', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.json': 'application/json' };

http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html'); // single-page app fallback
  res.setHeader('content-type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(8099);
