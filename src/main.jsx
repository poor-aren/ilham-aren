import { useEffect, useState, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Lanyard from './Lanyard.jsx';
import Stack from './Stack.jsx';
import LiquidEther from './LiquidEther.jsx';
import GlassSurface from './GlassSurface.jsx';
import Masonry from './Masonry.jsx';

const xml = (s) => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Header kartu (biru + nama + role), area bawah putih untuk foto. Self-contained SVG.
function headerSVG(card = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="768">
    <rect width="512" height="768" fill="#ffffff"/>
    <rect width="512" height="250" fill="#300584"/>
    <text x="40" y="130" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="800" fill="#ffffff" text-anchor="start">${xml(card.name)}</text>
    <text x="40" y="182" font-family="Inter, Arial, sans-serif" font-size="24" fill="#c9b6ff" text-anchor="start">${xml(card.role)}</text>
    <text x="40" y="742" font-family="Inter, Arial, sans-serif" font-size="20" fill="#b7b7bd" letter-spacing="3">PORTFOLIO · 2025</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Gabungkan header + foto ke satu PNG (foto mengisi area putih). Async karena foto perlu di-load.
function buildFront(card = {}, photoUrl) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 768;
    const ctx = canvas.getContext('2d');
    if (!ctx) { resolve(headerSVG(card)); return; }

    const bg = new Image();
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, 512, 768);
      if (!photoUrl) { resolve(canvas.toDataURL('image/png')); return; }

      const ph = new Image();
      ph.crossOrigin = 'anonymous';
      ph.onload = () => {
        const x = 40, y = 286, w = 432, h = 440, rr = 18;
        const scale = Math.max(w / ph.width, h / ph.height);
        const dw = ph.width * scale, dh = ph.height * scale;
        const dx = x + (w - dw) / 2, dy = y + (h - dh) / 2;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + rr, y);
        ctx.arcTo(x + w, y, x + w, y + h, rr);
        ctx.arcTo(x + w, y + h, x, y + h, rr);
        ctx.arcTo(x, y + h, x, y, rr);
        ctx.arcTo(x, y, x + w, y, rr);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(ph, dx, dy, dw, dh);
        ctx.restore();
        try { resolve(canvas.toDataURL('image/png')); }
        catch { resolve(headerSVG(card)); } // foto lintas-domain menodai canvas → fallback
      };
      ph.onerror = () => resolve(canvas.toDataURL('image/png'));
      ph.src = photoUrl;
    };
    bg.onerror = () => resolve(headerSVG(card));
    bg.src = headerSVG(card);
  });
}

function App() {
  const cfg = (typeof window !== 'undefined' && window.LANYARD_CONFIG) || {};
  const card = cfg.card || {};
  const photoUrl = (card.photo && card.photo.trim()) ? card.photo : null;
  const hasCustomFront = !!(cfg.frontImage && cfg.frontImage.trim());

  const [show, setShow] = useState(false);
  const [, setVer] = useState(0);
  const [front, setFront] = useState(() => hasCustomFront ? cfg.frontImage : headerSVG(card));

  // Data dari Supabase datang setelah mount → bangun ulang muka kartu & render ulang
  useEffect(() => {
    const onCfg = () => {
      const c = window.LANYARD_CONFIG || {};
      const cd = c.card || {};
      setVer(v => v + 1);
      if (c.frontImage && c.frontImage.trim()) setFront(c.frontImage);
      else buildFront(cd, (cd.photo && cd.photo.trim()) ? cd.photo : null).then(setFront);
    };
    window.addEventListener('lanyard-config-updated', onCfg);
    return () => window.removeEventListener('lanyard-config-updated', onCfg);
  }, []);

  useEffect(() => {
    const update = () =>
      setShow(document.body.dataset.page === 'contact' && window.innerWidth > 820);
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-page'] });
    window.addEventListener('resize', update);
    return () => { mo.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  useEffect(() => {
    if (hasCustomFront) { setFront(cfg.frontImage); return; }
    let alive = true;
    buildFront(card, photoUrl).then(d => { if (alive) setFront(d); });
    return () => { alive = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;

  return (
    <Lanyard
      position={[1.1, 0, 13]}
      gravity={[0, -40, 0]}
      glbUrl={cfg.glbUrl || '/card.glb'}
      bandImage={cfg.bandImage || '/lanyard.png'}
      frontImage={front}
      backImage={cfg.backImage && cfg.backImage.trim() ? cfg.backImage : null}
      imageFit="cover"
    />
  );
}

/* ---- Jembatan untuk halaman Activity (vanilla) memakai Stack React ----
   Kartu = 1 projek. SWIPE → ganti projek. TAP → ganti gambar dalam projek yang sama.
   Stack di-mount SEKALI (pre-warm saat load) lalu dipindah tiap kunjungan → tanpa jeda. */
let stackHost = null, stackRoot = null;

function GalleryCard({ images }) {
  const list = (images && images.length) ? images : [''];
  const [i, setI] = useState(0);
  return createElement('img', {
    src: list[i % list.length],
    alt: '', draggable: false,
    onClick: () => { if (list.length > 1) setI(v => v + 1); }
  });
}

function ensureActivityStack(imagesPerItem) {
  if (stackRoot) return;
  stackHost = document.createElement('div');
  stackHost.style.width = '100%';
  stackHost.style.height = '100%';
  const cards = imagesPerItem.map((imgs, i) => ({
    id: i + 1,
    content: createElement(GalleryCard, { images: imgs })
  }));
  cards.reverse(); // kartu teratas = elemen terakhir → item pertama (PIMNAS) tampil paling atas
  stackRoot = createRoot(stackHost);
  stackRoot.render(
    createElement(Stack, {
      cards,
      randomRotation: false,
      sensitivity: 150,
      sendToBackOnClick: false,   // TAP tidak ganti projek; tap = ganti gambar (di GalleryCard)
      animationConfig: { stiffness: 260, damping: 20 },
      onTopChange: (topId) => {
        window.__activityTopId = topId;
        if (window.__activityOnTop) window.__activityOnTop(topId);
      }
    })
  );
}

window.__mountActivityStack = (container, imagesPerItem, onTop) => {
  if (!container) return;
  window.__activityOnTop = onTop;
  ensureActivityStack(imagesPerItem);
  container.innerHTML = '';
  container.appendChild(stackHost);
};

window.__unmountActivityStack = () => {}; // no-op: Stack persisten

/* ---- Home: background dikosongkan (putih polos) ---- */
window.__mountHomeLiquid = () => {}; // no-op

/* ---- LiquidEther untuk halaman Projects (emas, lemah, balik cepat; persisten) ---- */
let projLiquidHost = null, projLiquidRoot = null;
function ensureProjLiquid() {
  if (projLiquidRoot) return;
  projLiquidHost = document.createElement('div');
  projLiquidHost.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  projLiquidRoot = createRoot(projLiquidHost);
  projLiquidRoot.render(createElement(LiquidEther, {
    colors: ['#8a6f2e', '#C9A24A', '#E7B996'], // emas di atas latar hitam
    mouseForce: 20, cursorSize: 100, resolution: 0.32, // kuat (spt referensi) tapi resolusi rendah → tak ngelag
    autoDemo: true, autoSpeed: 0.5, autoIntensity: 2.2,
    takeoverDuration: 0.25, autoResumeDelay: 3000, autoRampDuration: 0.6 // air tenang perlahan (spt referensi)
  }));
}
window.__mountProjLiquid = (container) => {
  if (!container) return;
  ensureProjLiquid();
  container.appendChild(projLiquidHost);
};

/* ---- Judul "Projects" di atas GlassSurface (layer terpisah) ---- */
let titleRoot = null;
window.__mountProjTitle = (container, text) => {
  if (!container) return;
  if (titleRoot) { try { titleRoot.unmount(); } catch (_) {} titleRoot = null; }
  titleRoot = createRoot(container);
  titleRoot.render(
    createElement(GlassSurface, {
      width: '100%', height: '100%', borderRadius: 18,
      brightness: 60, opacity: 0.9, blur: 10, displace: 0.4,
      distortionScale: -140, backgroundOpacity: 0.06, saturation: 1.4,
      className: 'proj-title-glass'
    }, createElement('span', { className: 'proj-title-text' }, text || 'Projects'))
  );
};

/* ---- Grid Projects memakai Masonry (5 kolom + animasi) ---- */
let masonryRoots = [];
window.__mountProjMasonry = (container, items, onClick, columns) => {
  if (!container) return;
  const root = createRoot(container);
  masonryRoots.push(root);
  root.render(createElement(Masonry, {
    items,
    maxColumns: columns || 5,
    animateFrom: 'bottom', duration: 0.6, stagger: 0.05,
    scaleOnHover: true, hoverScale: 0.96, blurToFocus: true,
    onItemClick: onClick
  }));
};
window.__unmountProjExtras = () => {
  if (titleRoot) { try { titleRoot.unmount(); } catch (_) {} titleRoot = null; }
  masonryRoots.forEach(r => { try { r.unmount(); } catch (_) {} });
  masonryRoots = [];
};

// Pre-warm Stack setelah data final (event dari index) → kunjungan pertama instan
function prewarm() {
  try {
    const imgs = window.__activityImages;
    if (imgs && imgs.length) ensureActivityStack(imgs);
  } catch (_) {}
}
if (window.__activityImages) prewarm();
window.addEventListener('app-data-ready', prewarm);

const el = document.getElementById('lanyard-root');
if (el) createRoot(el).render(<App />);
