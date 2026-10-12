import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5000);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8' };
http.createServer(async (req, res) => {
  if (req.url === '/healthz') { res.writeHead(200, {'Content-Type':'application/json'}); return res.end('{"status":"ok","mode":"demo"}'); }
  // Only serve the public entry point and client assets, never documentation or source references.
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (req.method !== 'GET' || !(name === '/' || /^\/src\/[a-z-]+\.(js|css)$/.test(name))) { res.writeHead(404); return res.end('Not found'); }
    const file = path.join(root, name === '/' ? 'index.html' : name);
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)], 'X-Content-Type-Options':'nosniff'}); res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`KI Tutor Demo: http://127.0.0.1:${port}`));
