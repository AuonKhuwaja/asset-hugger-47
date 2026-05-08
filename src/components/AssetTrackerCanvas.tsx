import { useRef, useEffect } from "react";

/**
 * Isometric IoT-style asset tracker animation.
 * Inspired by machine-tracking network diagrams: a central hub
 * connected via dashed lines to floating equipment + app-icon tiles.
 */

type Equip =
  | "washer"
  | "fridge"
  | "safe"
  | "tv"
  | "oven"
  | "robot"
  | "printer"
  | "ac";

interface EquipNode {
  label: string;
  equip: Equip;
  // normalized position around hub (-1..1)
  nx: number;
  ny: number;
  color: string;
}

interface AppTile {
  // small colorful rounded-square app icons
  nx: number;
  ny: number;
  color: string;
  glyph: "bell" | "wifi" | "globe" | "lock" | "bulb" | "leaf" | "drop" | "bolt" | "cam" | "star";
}

const EQUIP: EquipNode[] = [
  { label: "Washer",  equip: "washer",  nx: -0.55, ny:  0.35, color: "#E2E8F0" },
  { label: "Fridge",  equip: "fridge",  nx: -0.20, ny:  0.05, color: "#F1F5F9" },
  { label: "Safe",    equip: "safe",    nx:  0.20, ny:  0.20, color: "#1F2937" },
  { label: "TV",      equip: "tv",      nx:  0.60, ny:  0.05, color: "#0F172A" },
  { label: "Oven",    equip: "oven",    nx:  0.85, ny:  0.45, color: "#E5E7EB" },
  { label: "Robot",   equip: "robot",   nx:  0.05, ny:  0.55, color: "#10B981" },
  { label: "Printer", equip: "printer", nx: -0.05, ny: -0.40, color: "#CBD5E1" },
  { label: "AC",      equip: "ac",      nx:  0.40, ny: -0.40, color: "#F8FAFC" },
];

const APPS: AppTile[] = [
  { nx: -0.85, ny: -0.10, color: "#EF4444", glyph: "bell" },
  { nx: -0.78, ny:  0.18, color: "#F97316", glyph: "wifi" },
  { nx: -0.82, ny:  0.42, color: "#22C55E", glyph: "globe" },
  { nx: -0.45, ny: -0.55, color: "#A855F7", glyph: "cam" },
  { nx:  0.15, ny: -0.60, color: "#EF4444", glyph: "lock" },
  { nx: -0.40, ny: -0.20, color: "#FACC15", glyph: "bulb" },
  { nx:  0.55, ny:  0.55, color: "#22C55E", glyph: "leaf" },
  { nx: -0.25, ny:  0.55, color: "#3B82F6", glyph: "drop" },
  { nx:  0.95, ny:  0.10, color: "#EF4444", glyph: "star" },
  { nx:  0.92, ny:  0.65, color: "#A855F7", glyph: "bolt" },
];

// connections (indices into EQUIP, plus -1 = hub)
const LINKS: [number, number][] = [
  [-1, 0], [-1, 1], [-1, 2], [-1, 3], [-1, 5], [-1, 6], [-1, 7],
  [0, 1], [1, 2], [2, 3], [3, 4], [6, 7], [5, 1], [2, 5], [3, 7],
];

export function AssetTrackerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

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

    // ---------- isometric helpers ----------
    const ISO_X = 0.866; // cos(30)
    const ISO_Y = 0.5;   // sin(30)

    const isoTop = (cx: number, cy: number, w: number, d: number, color: string, stroke = "#0f172a") => {
      ctx.beginPath();
      ctx.moveTo(cx, cy - d * ISO_Y);
      ctx.lineTo(cx + w * ISO_X, cy);
      ctx.lineTo(cx, cy + d * ISO_Y);
      ctx.lineTo(cx - w * ISO_X, cy);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const isoBox = (cx: number, cy: number, w: number, d: number, h: number, top: string, left: string, right: string) => {
      // base center cy is the top-of-box center
      // top face
      ctx.beginPath();
      ctx.moveTo(cx, cy - d * ISO_Y);
      ctx.lineTo(cx + w * ISO_X, cy);
      ctx.lineTo(cx, cy + d * ISO_Y);
      ctx.lineTo(cx - w * ISO_X, cy);
      ctx.closePath();
      ctx.fillStyle = top;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // left face
      ctx.beginPath();
      ctx.moveTo(cx - w * ISO_X, cy);
      ctx.lineTo(cx, cy + d * ISO_Y);
      ctx.lineTo(cx, cy + d * ISO_Y + h);
      ctx.lineTo(cx - w * ISO_X, cy + h);
      ctx.closePath();
      ctx.fillStyle = left;
      ctx.fill();
      ctx.stroke();

      // right face
      ctx.beginPath();
      ctx.moveTo(cx + w * ISO_X, cy);
      ctx.lineTo(cx, cy + d * ISO_Y);
      ctx.lineTo(cx, cy + d * ISO_Y + h);
      ctx.lineTo(cx + w * ISO_X, cy + h);
      ctx.closePath();
      ctx.fillStyle = right;
      ctx.fill();
      ctx.stroke();
    };

    // shade helpers
    const shade = (hex: string, amt: number) => {
      const h = hex.replace("#", "");
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt)));
      return `rgb(${f(r)},${f(g)},${f(b)})`;
    };

    // ---------- equipment drawers ----------
    const drawWasher = (x: number, y: number, s: number) => {
      isoBox(x, y, s * 0.55, s * 0.55, s * 0.6, "#F8FAFC", "#94A3B8", "#CBD5E1");
      // door
      ctx.beginPath();
      ctx.arc(x + s * 0.18, y + s * 0.45, s * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = "#1E293B";
      ctx.fill();
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + s * 0.18, y + s * 0.45, s * 0.10, 0, Math.PI * 2);
      ctx.fillStyle = "#0EA5E9";
      ctx.fill();
    };

    const drawFridge = (x: number, y: number, s: number) => {
      isoBox(x, y - s * 0.2, s * 0.5, s * 0.45, s * 1.0, "#F1F5F9", "#94A3B8", "#E2E8F0");
      // divider line on right face
      ctx.beginPath();
      ctx.moveTo(x + s * 0.5 * ISO_X, y - s * 0.2 + s * 0.4);
      ctx.lineTo(x, y - s * 0.2 + s * 0.45 * ISO_Y + s * 0.4);
      ctx.strokeStyle = "#64748B";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawSafe = (x: number, y: number, s: number) => {
      isoBox(x, y, s * 0.5, s * 0.5, s * 0.55, "#1F2937", "#0F172A", "#111827");
      // dial
      ctx.beginPath();
      ctx.arc(x + s * 0.18, y + s * 0.42, s * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = "#F59E0B";
      ctx.fill();
    };

    const drawTV = (x: number, y: number, s: number) => {
      // screen as flat box
      isoBox(x, y, s * 0.7, s * 0.15, s * 0.5, "#0F172A", "#0B1220", "#111827");
      // screen glow
      ctx.fillStyle = "rgba(59,130,246,0.55)";
      ctx.fillRect(x - s * 0.55, y + s * 0.06, s * 1.1, s * 0.36);
    };

    const drawOven = (x: number, y: number, s: number) => {
      isoBox(x, y, s * 0.55, s * 0.55, s * 0.6, "#E5E7EB", "#9CA3AF", "#D1D5DB");
      // burners
      [[0.1, 0.05], [0.25, 0.05], [0.1, 0.18], [0.25, 0.18]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(x - s * 0.1 + dx * s, y - s * 0.05 + dy * s, s * 0.04, 0, Math.PI * 2);
        ctx.fillStyle = "#1F2937";
        ctx.fill();
      });
    };

    const drawRobot = (x: number, y: number, s: number) => {
      // disc-shaped vacuum
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.45, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#10B981";
      ctx.fill();
      ctx.strokeStyle = "#065F46";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, y - s * 0.05, s * 0.35, s * 0.16, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#34D399";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y - s * 0.05, s * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = "#0F172A";
      ctx.fill();
    };

    const drawPrinter = (x: number, y: number, s: number) => {
      isoBox(x, y, s * 0.55, s * 0.45, s * 0.4, "#E2E8F0", "#94A3B8", "#CBD5E1");
      // paper slot
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(x - s * 0.2, y + s * 0.2, s * 0.4, s * 0.04);
    };

    const drawAC = (x: number, y: number, s: number) => {
      isoBox(x, y, s * 0.7, s * 0.3, s * 0.25, "#F8FAFC", "#94A3B8", "#E2E8F0");
      // vent
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(x - s * 0.3, y + s * 0.18, s * 0.6, s * 0.04);
    };

    const drawEquip = (e: Equip, x: number, y: number, s: number) => {
      switch (e) {
        case "washer":  return drawWasher(x, y, s);
        case "fridge":  return drawFridge(x, y, s);
        case "safe":    return drawSafe(x, y, s);
        case "tv":      return drawTV(x, y, s);
        case "oven":    return drawOven(x, y, s);
        case "robot":   return drawRobot(x, y, s);
        case "printer": return drawPrinter(x, y, s);
        case "ac":      return drawAC(x, y, s);
      }
    };

    // ---------- app icon tile ----------
    const drawAppTile = (x: number, y: number, s: number, color: string, glyph: AppTile["glyph"]) => {
      // shadow
      ctx.beginPath();
      ctx.ellipse(x, y + s * 0.55, s * 0.4, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fill();

      const r = s * 0.18;
      // gradient body
      const g = ctx.createLinearGradient(x - s * 0.4, y - s * 0.4, x + s * 0.4, y + s * 0.4);
      g.addColorStop(0, shade(color, 30));
      g.addColorStop(1, shade(color, -25));
      ctx.beginPath();
      (ctx as any).roundRect(x - s * 0.4, y - s * 0.4, s * 0.8, s * 0.8, r);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // glyph
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";

      const cx = x, cy = y;
      switch (glyph) {
        case "bell":
          ctx.beginPath();
          ctx.moveTo(cx - s * 0.14, cy + s * 0.06);
          ctx.quadraticCurveTo(cx - s * 0.14, cy - s * 0.18, cx, cy - s * 0.18);
          ctx.quadraticCurveTo(cx + s * 0.14, cy - s * 0.18, cx + s * 0.14, cy + s * 0.06);
          ctx.lineTo(cx - s * 0.14, cy + s * 0.06);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, cy + s * 0.13, s * 0.04, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "wifi":
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy + s * 0.12, s * (0.08 + i * 0.07), Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(cx, cy + s * 0.12, s * 0.03, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "globe":
          ctx.beginPath();
          ctx.arc(cx, cy, s * 0.18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(cx, cy, s * 0.08, s * 0.18, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx - s * 0.18, cy);
          ctx.lineTo(cx + s * 0.18, cy);
          ctx.stroke();
          break;
        case "lock":
          (ctx as any).roundRect(cx - s * 0.13, cy - s * 0.02, s * 0.26, s * 0.22, s * 0.04);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, cy - s * 0.02, s * 0.1, Math.PI, 0);
          ctx.stroke();
          break;
        case "bulb":
          ctx.beginPath();
          ctx.arc(cx, cy - s * 0.04, s * 0.12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx - s * 0.06, cy + s * 0.08, s * 0.12, s * 0.08);
          break;
        case "leaf":
          ctx.beginPath();
          ctx.moveTo(cx - s * 0.16, cy + s * 0.16);
          ctx.quadraticCurveTo(cx - s * 0.18, cy - s * 0.18, cx + s * 0.16, cy - s * 0.16);
          ctx.quadraticCurveTo(cx + s * 0.18, cy + s * 0.18, cx - s * 0.16, cy + s * 0.16);
          ctx.fill();
          break;
        case "drop":
          ctx.beginPath();
          ctx.moveTo(cx, cy - s * 0.18);
          ctx.quadraticCurveTo(cx + s * 0.16, cy + s * 0.04, cx, cy + s * 0.18);
          ctx.quadraticCurveTo(cx - s * 0.16, cy + s * 0.04, cx, cy - s * 0.18);
          ctx.fill();
          break;
        case "bolt":
          ctx.beginPath();
          ctx.moveTo(cx + s * 0.04, cy - s * 0.18);
          ctx.lineTo(cx - s * 0.10, cy + s * 0.02);
          ctx.lineTo(cx, cy + s * 0.02);
          ctx.lineTo(cx - s * 0.04, cy + s * 0.18);
          ctx.lineTo(cx + s * 0.12, cy - s * 0.04);
          ctx.lineTo(cx + s * 0.02, cy - s * 0.04);
          ctx.closePath();
          ctx.fill();
          break;
        case "cam":
          (ctx as any).roundRect(cx - s * 0.16, cy - s * 0.10, s * 0.32, s * 0.22, s * 0.04);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(cx, cy + s * 0.01, s * 0.07, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "star":
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x1 = cx + Math.cos(a) * s * 0.16;
            const y1 = cy + Math.sin(a) * s * 0.16;
            const a2 = a + Math.PI / 5;
            const x2 = cx + Math.cos(a2) * s * 0.07;
            const y2 = cy + Math.sin(a2) * s * 0.07;
            if (i === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.closePath();
          ctx.fill();
          break;
      }
    };

    // ---------- main loop ----------
    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      // background gradient (blue marketing style)
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#1E40AF");
      bg.addColorStop(0.5, "#2563EB");
      bg.addColorStop(1, "#3B82F6");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // diagonal sheen
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.55, 0);
      ctx.lineTo(w * 0.15, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // subtle stars / dots
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137) % w;
        const sy = (i * 89) % h;
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h);
      const radius = scale * 0.35;
      const eqSize = scale * 0.18;
      const appSize = scale * 0.13;

      const float = (i: number) => Math.sin(t * 1.4 + i) * 3;

      const equipPos = EQUIP.map((e, i) => ({
        x: cx + e.nx * radius,
        y: cy + e.ny * radius + float(i),
      }));
      const hub = { x: cx, y: cy };

      // ---- dashed connection lines ----
      ctx.setLineDash([5, 6]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(220, 255, 130, 0.85)"; // lime/yellow-green like reference
      const dashOffset = -(t * 18) % 22;
      ctx.lineDashOffset = dashOffset;

      LINKS.forEach(([a, b]) => {
        const p1 = a === -1 ? hub : equipPos[a];
        const p2 = b === -1 ? hub : equipPos[b];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.lineDashOffset = 0;

      // node dots at line endpoints
      equipPos.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#FDE047";
        ctx.fill();
      });

      // ---- equipment ----
      EQUIP.forEach((e, i) => {
        const p = equipPos[i];
        drawEquip(e.equip, p.x, p.y, eqSize);
      });

      // ---- central hub: laptop with logo ----
      // laptop base
      ctx.save();
      const lx = cx;
      const ly = cy;
      // screen
      const scrW = scale * 0.16;
      const scrH = scale * 0.11;
      (ctx as any).roundRect(lx - scrW / 2, ly - scrH, scrW, scrH, 4);
      ctx.fillStyle = "#0F172A";
      ctx.fill();
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 2;
      ctx.stroke();
      // screen content
      (ctx as any).roundRect(lx - scrW / 2 + 4, ly - scrH + 4, scrW - 8, scrH - 8, 3);
      ctx.fillStyle = "#fff";
      ctx.fill();
      // logo "house"
      ctx.fillStyle = "#2563EB";
      ctx.beginPath();
      ctx.moveTo(lx, ly - scrH * 0.75);
      ctx.lineTo(lx - scrW * 0.18, ly - scrH * 0.45);
      ctx.lineTo(lx + scrW * 0.18, ly - scrH * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(lx - scrW * 0.13, ly - scrH * 0.45, scrW * 0.26, scrH * 0.25);
      // base
      ctx.beginPath();
      ctx.moveTo(lx - scrW * 0.7, ly + 2);
      ctx.lineTo(lx + scrW * 0.7, ly + 2);
      ctx.lineTo(lx + scrW * 0.55, ly + 8);
      ctx.lineTo(lx - scrW * 0.55, ly + 8);
      ctx.closePath();
      ctx.fillStyle = "#E5E7EB";
      ctx.fill();
      ctx.strokeStyle = "#94A3B8";
      ctx.stroke();
      ctx.restore();

      // ---- floating app tiles ----
      APPS.forEach((a, i) => {
        const ax = cx + a.nx * radius * 1.15;
        const ay = cy + a.ny * radius * 1.05 + Math.sin(t * 1.6 + i * 0.7) * 4;
        // tilt by subtle scale shift
        drawAppTile(ax, ay, appSize, a.color, a.glyph);
      });

      // brand mark top right
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "700 13px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("TrackVault", w - 16, 22);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "500 10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Asset Tracking Network", w - 16, 38);

      // tagline bottom
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "700 12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Asset Tracking Software", w - 16, h - 22);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "500 10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText("Get your equipment under control", w - 16, h - 8);

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
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
