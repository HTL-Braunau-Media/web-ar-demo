/* global AFRAME */

// Alle Maße in Target-Einheiten: Bildbreite = 1, Ursprung = Bildmitte,
// x nach rechts, y nach oben, z aus dem Papier heraus.
// Umrechnung aus target.svg (1200 px breit): x = (px - 600) / 1200, y = (450 - py) / 1200
const INK = '#111111';
const LINE = 0.0085;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
// weiches Ein-/Ausblenden zwischen zwei Zeitpunkten
const ramp = (t, from, to) => {
  const p = clamp01((t - from) / (to - from));
  return p * p * (3 - 2 * p);
};

function line(parent, x1, y1, x2, y2) {
  const el = document.createElement('a-plane');
  const len = Math.hypot(x2 - x1, y2 - y1);
  el.setAttribute('width', len + LINE); // + LINE: Enden überlappen wie bei runden Linienenden
  el.setAttribute('height', LINE);
  el.setAttribute('material', `color: ${INK}; shader: flat; side: double`);
  el.object3D.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
  el.object3D.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  parent.appendChild(el);
  return el;
}

// Strichmännchen, Ursprung an den Füßen – deckungsgleich mit dem gedruckten.
AFRAME.registerComponent('stickman', {
  init() {
    const el = this.el;
    line(el, 0, 0.0917, -0.04, 0); // Beine
    line(el, 0, 0.0917, 0.04, 0);
    line(el, 0, 0.0917, 0, 0.175); // Körper
    line(el, 0, 0.165, -0.06, 0.1); // linker Arm

    // rechter Arm hängt an einem Drehpunkt in der Schulter -> kann winken
    this.arm = document.createElement('a-entity');
    this.arm.object3D.position.set(0, 0.165, 0);
    line(this.arm, 0, 0, 0.06, -0.065);
    el.appendChild(this.arm);

    const head = document.createElement('a-ring');
    head.setAttribute('radius-inner', 0.0342 - LINE / 2);
    head.setAttribute('radius-outer', 0.0342 + LINE / 2);
    head.setAttribute('material', `color: ${INK}; shader: flat; side: double`);
    head.object3D.position.set(0, 0.2167, 0);
    el.appendChild(head);
  },
});

// Der Ablauf, sobald der Zettel erkannt wird (Zeiten in Sekunden, läuft in Schleife):
//  0 –  1   alles liegt flach und deckt sich mit dem Druck
//  1 –  2   Strichmännchen hebt sich leicht vom Papier ab (nur wenig, sonst
//            wirkt es beim Blick von oben gestaucht)
//  2 –  9   es winkt
//  3 –  3.5 der rote Punkt wird zur Kugel
//  3.5 – 7  die Kugel hüpft nach rechts vom Zettel
//  9 – 10   alles zurück auf Anfang
const LOOP = 10.5;
const BALL_R = 0.0417;
const BALL_START = { x: 0.1333, y: -0.125 };

AFRAME.registerComponent('show', {
  init() {
    this.t = 0;
    this.running = false;
    this.man = this.el.querySelector('#man');
    this.ball = this.el.querySelector('#ball');

    this.el.addEventListener('targetFound', () => {
      this.t = 0;
      this.running = true;
    });
    this.el.addEventListener('targetLost', () => {
      this.running = false;
    });
    this.apply(0);
  },

  tick(time, dt) {
    if (!this.running) return;
    this.t = (this.t + dt / 1000) % LOOP;
    this.apply(this.t);
  },

  apply(t) {
    const back = 1 - ramp(t, 9, 10); // 1 = Show läuft, 0 = Ausgangslage

    // Strichmännchen: aufrichten (Kippen um die Füße) + winken
    const man = this.man.object3D;
    man.rotation.x = THREE.MathUtils.degToRad(20) * ramp(t, 1, 2) * back;
    const arm = this.man.components.stickman.arm.object3D;
    const wave = ramp(t, 2, 2.4) * (1 - ramp(t, 8.6, 9));
    arm.rotation.z = THREE.MathUtils.degToRad(85 + 25 * Math.sin(t * 9)) * wave;

    // Roter Punkt: aufblasen, weghüpfen, am Ende zurück
    const ball = this.ball.object3D;
    const inflate = ramp(t, 3, 3.5) * back;
    const hop = clamp01((t - 3.5) / 3.5);
    const height = Math.abs(Math.sin(hop * Math.PI * 5)) * 0.13 * (1 - hop * 0.4);
    const squash = 1 - 0.25 * Math.max(0, 1 - height / 0.02) * (hop > 0 && hop < 1 ? 1 : 0);
    ball.scale.set(1, 1, Math.max(0.03, inflate * squash));
    ball.position.set(
      BALL_START.x + hop * 0.62 * back,
      BALL_START.y,
      0.004 + (BALL_R + height) * inflate,
    );
  },
});
