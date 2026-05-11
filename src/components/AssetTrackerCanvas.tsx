import { useRef, useEffect } from "react";

/**
 * Theme-aware asset tracker animation.
 * Premium orbital network: a glowing central core with concentric
 * orbits, traveling data packets, and floating asset nodes.
 * Colors adapt to active theme (violet in dark, blue in light).
 */

type Glyph =
  | "package" | "laptop" | "phone" | "monitor"
  | "printer" | "camera" | "server" | "tablet";

interface Node {
  angle: number;       // initial angle (radians)
  orbit: number;       // 0..1 fraction of max radius
  speed: number;       // rad/sec
  size: number;        // 0..1 scale
  glyph: Glyph;
  pulse: number;       // pulse phase
}

const NODES: Node[] = [
  { angle: 0.0,   orbit: 0.42, speed: 0.10,  size: 1.0, glyph: "laptop",  pulse: 0.0 },
  { angle: 0.9,   orbit: 0.42, speed: 0.10,  size: 0.9, glyph: "phone",   pulse: 0.5 },
  { angle: 1.9,   orbit: 0.42, speed: 0.10,  size: 1.0, glyph: "monitor", pulse: 1.1 },
  { angle: 3.0,   orbit: 0.42, speed: 0.10,  size: 0.85, glyph: "package",pulse: 1.7 },
  { angle: 4.1,   orbit: 0.42, speed: 0.10,  size: 0.9, glyph: "camera",  pulse: 2.3 },
  { angle: 5.2,   orbit: 0.42, speed: 0.10,  size: 0.95, glyph: "printer",pulse: 2.9 },

  { angle: 0.4,   orbit: 0.78, speed: -0.06, size: 0.85, glyph: "server", pulse: 0.2 },
  { angle: 1.7,   orbit: 0.78, speed: -0.06, size: 0.8, glyph: "tablet",  pulse: 0.8 },
  { angle: 3.2,   orbit: 0.78, speed: -0.06, size: 0.9, glyph: "package", pulse: 1.4 },
  { angle: 4.6,   orbit: 0.78, speed: -0.06, size: 0.85, glyph: "monitor",pulse: 2.0 },
  { angle: 5.9,   orbit: 0.78, speed: -0.06, size: 0.8, glyph: "phone",   pulse: 2.6 },
];

function readThemeColors() {
  const isLight = document.documentElement.classList.contains("light");
  if (isLight) {
    return {
      isLight: true,
      bgFrom: "#EFF6FF",
      bgVia:  "#DBEAFE",
      bgTo:   "#2141ac",
      glow:   "59, 130, 246",   // primary blue
      glow2:  "99, 102, 241",   // indigo
      ring:   "rgba(59, 130, 246, 0.35)",
      ringSoft: "rgba(59, 130, 246, 0.12)",
      line:   "rgba(59, 130, 246, 0.55)",
      packet: "#2563EB",
      core1:  "#05398c",
      core2:  "#6366F1",
      node:   "#FFFFFF",
      nodeStroke: "rgba(59, 130, 246, 0.45)",
      nodeIcon:  "#0a42bd",
      text:   "rgba(30, 41, 59, 0.85)",
      textSub:"rgba(30, 41, 59, 0.55)",
      grid:   "rgba(59, 130, 246, 0.08)",
    };
  }
  return {
    isLight: false,
    bgFrom: "#15102A",
    bgVia:  "#1A1235",
    bgTo:   "#221540",
    glow:   "168, 85, 247",   // violet
    glow2:  "192, 132, 252",  // light violet
    ring:   "rgba(168, 85, 247, 0.40)",
    ringSoft: "rgba(168, 85, 247, 0.10)",
    line:   "rgba(192, 132, 252, 0.55)",
    packet: "#C084FC",
    core1:  "#A855F7",
    core2:  "#7C3AED",
    node:   "rgba(255, 255, 255, 0.07)",
    nodeStroke: "rgba(192, 132, 252, 0.50)",
    nodeIcon:  "#E9D5FF",
    text:   "rgba(243, 232, 255, 0.92)",
    textSub:"rgba(216, 180, 254, 0.65)",
    grid:   "rgba(168, 85, 247, 0.07)",
  };
}

export function AssetTrackerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let theme = readThemeColors();

    // Watch for theme changes
    const observer = new MutationObserver(() => { theme = readThemeColors(); });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // ---------- glyph drawer ----------
    const drawGlyph = (g: Glyph, x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (g) {
        case "package":
          ctx.beginPath();
          ctx.rect(x - s * 0.45, y - s * 0.4, s * 0.9, s * 0.8);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - s * 0.45, y);
          ctx.lineTo(x + s * 0.45, y);
          ctx.moveTo(x, y - s * 0.4);
          ctx.lineTo(x, y + s * 0.4);
          ctx.stroke();
          break;
        case "laptop":
          ctx.beginPath();
          ctx.rect(x - s * 0.42, y - s * 0.3, s * 0.84, s * 0.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - s * 0.55, y + s * 0.28);
          ctx.lineTo(x + s * 0.55, y + s * 0.28);
          ctx.stroke();
          break;
        case "phone":
          ctx.beginPath();
          (ctx as any).roundRect(x - s * 0.22, y - s * 0.42, s * 0.44, s * 0.84, s * 0.06);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y + s * 0.3, s * 0.04, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "monitor":
          ctx.beginPath();
          ctx.rect(x - s * 0.45, y - s * 0.35, s * 0.9, s * 0.55);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y + s * 0.2);
          ctx.lineTo(x, y + s * 0.4);
          ctx.moveTo(x - s * 0.2, y + s * 0.4);
          ctx.lineTo(x + s * 0.2, y + s * 0.4);
          ctx.stroke();
          break;
        case "printer":
          ctx.beginPath();
          ctx.rect(x - s * 0.42, y - s * 0.1, s * 0.84, s * 0.4);
          ctx.stroke();
          ctx.beginPath();
          ctx.rect(x - s * 0.3, y - s * 0.4, s * 0.6, s * 0.3);
          ctx.stroke();
          ctx.beginPath();
          ctx.rect(x - s * 0.3, y + s * 0.15, s * 0.6, s * 0.25);
          ctx.stroke();
          break;
        case "camera":
          ctx.beginPath();
          (ctx as any).roundRect(x - s * 0.45, y - s * 0.28, s * 0.9, s * 0.6, s * 0.08);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y + s * 0.02, s * 0.18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y + s * 0.02, s * 0.06, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "server":
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.rect(x - s * 0.4, y - s * 0.4 + i * s * 0.28, s * 0.8, s * 0.2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + s * 0.28, y - s * 0.3 + i * s * 0.28, s * 0.04, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        case "tablet":
          ctx.beginPath();
          (ctx as any).roundRect(x - s * 0.35, y - s * 0.45, s * 0.7, s * 0.9, s * 0.06);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y + s * 0.34, s * 0.04, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    };

    // ---------- main loop ----------
    const draw = () => {
      const w = W();
      const h = H();
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.46;

      // -- background --
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, theme.bgFrom);
      bg.addColorStop(0.55, theme.bgVia);
      bg.addColorStop(1, theme.bgTo);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // central radial glow
      const radial = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.2);
      radial.addColorStop(0, `rgba(${theme.glow}, ${theme.isLight ? 0.18 : 0.30})`);
      radial.addColorStop(0.5, `rgba(${theme.glow}, ${theme.isLight ? 0.06 : 0.10})`);
      radial.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, w, h);

      // subtle dot grid
      ctx.fillStyle = theme.grid;
      const step = 28;
      for (let x = (step / 2); x < w; x += step) {
        for (let y = (step / 2); y < h; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // -- concentric orbit rings --
      const orbits = [0.42, 0.78];
      orbits.forEach((o, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * o, 0, Math.PI * 2);
        ctx.setLineDash([3, 8]);
        ctx.lineDashOffset = -t * (idx === 0 ? 12 : -8);
        ctx.strokeStyle = theme.ring;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.setLineDash([]);

        // soft halo
        ctx.beginPath();
        ctx.arc(cx, cy, R * o, 0, Math.PI * 2);
        ctx.strokeStyle = theme.ringSoft;
        ctx.lineWidth = 8;
        ctx.stroke();
      });

      // -- nodes (positions) --
      const positions = NODES.map((n) => {
        const a = n.angle + n.speed * t;
        const px = cx + Math.cos(a) * R * n.orbit;
        const py = cy + Math.sin(a) * R * n.orbit;
        return { ...n, x: px, y: py, a };
      });

      // -- connecting lines from core to inner orbit --
      positions.forEach((p) => {
        if (p.orbit < 0.5) {
          const grad = ctx.createLinearGradient(cx, cy, p.x, p.y);
          grad.addColorStop(0, `rgba(${theme.glow}, 0.55)`);
          grad.addColorStop(1, `rgba(${theme.glow}, 0.05)`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      });

      // -- chords between alternating outer nodes (network feel) --
      const outer = positions.filter((p) => p.orbit > 0.5);
      ctx.strokeStyle = `rgba(${theme.glow2}, 0.18)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < outer.length; i++) {
        const a = outer[i];
        const b = outer[(i + 2) % outer.length];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // -- traveling data packets along inner orbit --
      const packetCount = 4;
      for (let i = 0; i < packetCount; i++) {
        const a = (t * 0.6) + (i * Math.PI * 2) / packetCount;
        const px = cx + Math.cos(a) * R * 0.42;
        const py = cy + Math.sin(a) * R * 0.42;
        // glow
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 14);
        pg.addColorStop(0, `rgba(${theme.glow2}, 0.9)`);
        pg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = theme.packet;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // -- nodes (cards) --
      positions.forEach((p) => {
        const baseSize = Math.min(w, h) * 0.045 * p.size;
        const pulse = 1 + Math.sin(t * 2 + p.pulse) * 0.06;
        const s = baseSize * pulse;

        // halo
        const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 2.4);
        halo.addColorStop(0, `rgba(${theme.glow}, ${theme.isLight ? 0.20 : 0.35})`);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(p.x, p.y, s * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // node card
        ctx.beginPath();
        (ctx as any).roundRect(p.x - s, p.y - s, s * 2, s * 2, s * 0.32);
        ctx.fillStyle = theme.node;
        ctx.fill();
        ctx.strokeStyle = theme.nodeStroke;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        drawGlyph(p.glyph, p.x, p.y, s * 1.35, theme.nodeIcon);
      });

      // -- central core --
      const coreR = Math.min(w, h) * 0.075;
      // outer halo
      const coreHalo = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
      coreHalo.addColorStop(0, `rgba(${theme.glow}, ${theme.isLight ? 0.45 : 0.65})`);
      coreHalo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = coreHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
      ctx.fill();

      // core body
      const coreGrad = ctx.createLinearGradient(cx - coreR, cy - coreR, cx + coreR, cy + coreR);
      coreGrad.addColorStop(0, theme.core1);
      coreGrad.addColorStop(1, theme.core2);
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // core inner ring
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 0.7, 0, Math.PI * 2);
      ctx.stroke();

      // core glyph (vault/shield)
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - coreR * 0.45);
      ctx.lineTo(cx + coreR * 0.4, cy - coreR * 0.2);
      ctx.lineTo(cx + coreR * 0.4, cy + coreR * 0.15);
      ctx.quadraticCurveTo(cx + coreR * 0.4, cy + coreR * 0.42, cx, cy + coreR * 0.5);
      ctx.quadraticCurveTo(cx - coreR * 0.4, cy + coreR * 0.42, cx - coreR * 0.4, cy + coreR * 0.15);
      ctx.lineTo(cx - coreR * 0.4, cy - coreR * 0.2);
      ctx.closePath();
      ctx.stroke();

      // checkmark inside shield
      ctx.beginPath();
      ctx.moveTo(cx - coreR * 0.18, cy + coreR * 0.05);
      ctx.lineTo(cx - coreR * 0.02, cy + coreR * 0.22);
      ctx.lineTo(cx + coreR * 0.22, cy - coreR * 0.12);
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // -- corner labels --
      ctx.fillStyle = theme.text;
      ctx.font = "700 13px 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("TrackVault", 18, 26);
      ctx.fillStyle = theme.textSub;
      ctx.font = "500 11px 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Asset Intelligence Network", 18, 42);

      // status pill bottom-left
      ctx.beginPath();
      (ctx as any).roundRect(14, h - 38, 110, 24, 12);
      ctx.fillStyle = `rgba(${theme.glow}, ${theme.isLight ? 0.12 : 0.18})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${theme.glow}, 0.35)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      // pulse dot
      const pulseAlpha = 0.5 + Math.sin(t * 3) * 0.4;
      ctx.fillStyle = `rgba(${theme.glow}, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(28, h - 26, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme.text;
      ctx.font = "600 10px 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("LIVE TRACKING", 40, h - 22);

      // bottom-right caption
      ctx.textAlign = "right";
      ctx.fillStyle = theme.text;
      ctx.font = "700 12px 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(`${positions.length} Connected Assets`, w - 18, h - 30);
      ctx.fillStyle = theme.textSub;
      ctx.font = "500 10px 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Real-time monitoring & lifecycle", w - 18, h - 14);

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-3xl"
      style={{ display: "block" }}
    />
  );
}
