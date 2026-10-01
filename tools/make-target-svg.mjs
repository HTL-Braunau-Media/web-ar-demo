// Erzeugt target.svg: der "Zettel" mit Strichmännchen + rotem Punkt.
// Der bunte Rand ist kein Schmuck – MindAR braucht viele kontrastreiche
// Ecken/Kanten, um das Bild zu erkennen. Ein roter Punkt allein reicht nicht.
import { writeFileSync } from 'node:fs';

const W = 1200, H = 900;
const NOTE = { x: 200, y: 170, w: 800, h: 560 };

// Seeded RNG, damit das Target bei jedem Lauf identisch ist
let seed = 42;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const colors = ['#111111', '#111111', '#1d4ed8', '#059669', '#d97706', '#7c3aed', '#be123c', '#0e7490'];

const inNote = (x, y, pad) =>
  x > NOTE.x - pad && x < NOTE.x + NOTE.w + pad && y > NOTE.y - pad && y < NOTE.y + NOTE.h + pad;

let shapes = '';
let placed = 0;
while (placed < 170) {
  const x = rnd() * W, y = rnd() * H;
  const s = 18 + rnd() * 34;
  if (inNote(x, y, s)) continue;
  const c = pick(colors);
  const rot = Math.floor(rnd() * 360);
  const kind = Math.floor(rnd() * 5);
  const t = `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot})"`;
  if (kind === 0) {
    shapes += `<polygon ${t} points="0,${-s} ${s * 0.9},${s * 0.7} ${-s * 0.9},${s * 0.7}" fill="${c}"/>`;
  } else if (kind === 1) {
    shapes += `<rect ${t} x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" fill="none" stroke="${c}" stroke-width="7"/>`;
  } else if (kind === 2) {
    shapes += `<path ${t} d="M${-s},0 L${-s / 2},${-s / 2} L0,0 L${s / 2},${-s / 2} L${s},0" fill="none" stroke="${c}" stroke-width="7"/>`;
  } else if (kind === 3) {
    shapes += `<path ${t} d="M${-s / 2},0 H${s / 2} M0,${-s / 2} V${s / 2}" stroke="${c}" stroke-width="9"/>`;
  } else {
    shapes += `<polygon ${t} points="0,${-s} ${s * 0.3},${-s * 0.3} ${s},0 ${s * 0.3},${s * 0.3} 0,${s} ${-s * 0.3},${s * 0.3} ${-s},0 ${-s * 0.3},${-s * 0.3}" fill="${c}"/>`;
  }
  shapes += '\n';
  placed++;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#ffffff"/>
${shapes}
<rect x="${NOTE.x}" y="${NOTE.y}" width="${NOTE.w}" height="${NOTE.h}" fill="#fff3b0" stroke="#111111" stroke-width="8"/>
<!-- Strichmännchen (Füße bei 420/650) -->
<g fill="none" stroke="#111111" stroke-width="10" stroke-linecap="round">
  <circle cx="420" cy="390" r="41"/>
  <path d="M420,440 V540 M420,540 L372,650 M420,540 L468,650 M420,452 L348,530 M420,452 L492,530"/>
</g>
<!-- Roter Punkt -->
<circle cx="760" cy="600" r="50" fill="#e11d48"/>
</svg>
`;

writeFileSync(new URL('../assets/target.svg', import.meta.url), svg);
console.log('assets/target.svg geschrieben');
