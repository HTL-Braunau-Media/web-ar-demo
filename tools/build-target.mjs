// Baut assets/target.png und assets/targets.mind automatisch:
// startet einen Mini-Webserver, öffnet tools/compile.html in Headless-Chrome
// und speichert das Ergebnis. Alternative ohne Script: compile.html im
// Browser öffnen und die zwei Dateien von Hand herunterladen.
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

await import('./make-target-svg.mjs');

const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.png': 'image/png' };

const server = createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(req.url.split('?')[0]));
    const data = await readFile(join(root, path));
    res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('Seitenfehler:', e.message));
  await page.goto(`http://localhost:${port}/tools/compile.html`);
  await page.waitForFunction('window.__result', { timeout: 180000 });
  const { png, mind } = await page.evaluate('window.__result');
  await writeFile(join(root, 'assets/target.png'), Buffer.from(png.split(',')[1], 'base64'));
  await writeFile(join(root, 'assets/targets.mind'), Buffer.from(mind));
  console.log(`assets/target.png und assets/targets.mind geschrieben (${mind.length} Bytes)`);
} finally {
  await browser.close();
  server.close();
}
