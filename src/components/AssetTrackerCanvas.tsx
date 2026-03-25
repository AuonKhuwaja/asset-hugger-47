import { useRef, useEffect } from "react";

interface AssetNode {
  label: string;
  color: string;
  angle: number; // starting angle in radians
  speed: number; // orbit speed multiplier
  icon: "laptop" | "printer" | "forklift" | "projector" | "mobile" | "monitor";
}

const NODES: AssetNode[] = [
  { label: "Laptop",    color: "#4299e1", angle: 0,            speed: 0.3,  icon: "laptop" },
  { label: "Printer",   color: "#48bb78", angle: Math.PI / 3,  speed: 0.25, icon: "printer" },
  { label: "Forklift",  color: "#f56565", angle: (2 * Math.PI) / 3, speed: 0.35, icon: "forklift" },
  { label: "Projector", color: "#ecc94b", angle: Math.PI,      speed: 0.28, icon: "projector" },
  { label: "Mobile",    color: "#9f7aea", angle: (4 * Math.PI) / 3, speed: 0.32, icon: "mobile" },
  { label: "Monitor",   color: "#06b6d4", angle: (5 * Math.PI) / 3, speed: 0.22, icon: "monitor" },
];

export function AssetTrackerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // --- Icon drawing helpers ---
    const drawLaptopIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = "round";
      const sw = s * 0.7, sh = s * 0.45;
      ctx.beginPath(); ctx.rect(x - sw / 2, y - sh / 2 - s * 0.08, sw, sh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - sw / 2 - s * 0.1, y + sh / 2 - s * 0.08); ctx.lineTo(x + sw / 2 + s * 0.1, y + sh / 2 - s * 0.08); ctx.stroke();
    };
    const drawPrinterIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      const bw = s * 0.6, bh = s * 0.35, pw = s * 0.4;
      ctx.beginPath(); ctx.rect(x - bw / 2, y - bh / 2, bw, bh); ctx.stroke();
      ctx.beginPath(); ctx.rect(x - pw / 2, y - bh / 2 - s * 0.18, pw, s * 0.18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - pw / 2, y + bh / 2); ctx.lineTo(x - pw / 2, y + bh / 2 + s * 0.15); ctx.lineTo(x + pw / 2, y + bh / 2 + s * 0.15); ctx.lineTo(x + pw / 2, y + bh / 2); ctx.stroke();
    };
    const drawForkliftIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.rect(x - s * 0.2, y - s * 0.3, s * 0.4, s * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + s * 0.2, y + s * 0.05); ctx.lineTo(x + s * 0.4, y + s * 0.05); ctx.lineTo(x + s * 0.4, y + s * 0.3); ctx.stroke();
      ctx.beginPath(); ctx.arc(x - s * 0.1, y + s * 0.1, s * 0.07, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + s * 0.1, y + s * 0.1, s * 0.07, 0, Math.PI * 2); ctx.stroke();
    };
    const drawProjectorIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      const bw = s * 0.65, bh = s * 0.3;
      ctx.beginPath(); ctx.rect(x - bw / 2, y - bh / 2, bw, bh); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + bw / 2, y, s * 0.12, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = color + "44";
      ctx.beginPath(); ctx.moveTo(x + bw / 2 + s * 0.12, y - s * 0.08); ctx.lineTo(x + bw / 2 + s * 0.35, y - s * 0.2); ctx.moveTo(x + bw / 2 + s * 0.12, y + s * 0.08); ctx.lineTo(x + bw / 2 + s * 0.35, y + s * 0.2); ctx.stroke();
    };
    const drawMobileIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      const pw = s * 0.3, ph = s * 0.55, r = 3;
      ctx.beginPath();
      ctx.moveTo(x - pw / 2 + r, y - ph / 2); ctx.lineTo(x + pw / 2 - r, y - ph / 2);
      ctx.quadraticCurveTo(x + pw / 2, y - ph / 2, x + pw / 2, y - ph / 2 + r);
      ctx.lineTo(x + pw / 2, y + ph / 2 - r);
      ctx.quadraticCurveTo(x + pw / 2, y + ph / 2, x + pw / 2 - r, y + ph / 2);
      ctx.lineTo(x - pw / 2 + r, y + ph / 2);
      ctx.quadraticCurveTo(x - pw / 2, y + ph / 2, x - pw / 2, y + ph / 2 - r);
      ctx.lineTo(x - pw / 2, y - ph / 2 + r);
      ctx.quadraticCurveTo(x - pw / 2, y - ph / 2, x - pw / 2 + r, y - ph / 2);
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - pw / 2, y - ph / 2 + ph * 0.15); ctx.lineTo(x + pw / 2, y - ph / 2 + ph * 0.15); ctx.stroke();
    };
    const drawMonitorIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      const mw = s * 0.65, mh = s * 0.4;
      ctx.beginPath(); ctx.rect(x - mw / 2, y - mh / 2 - s * 0.05, mw, mh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + mh / 2 - s * 0.05); ctx.lineTo(x, y + mh / 2 + s * 0.1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - s * 0.15, y + mh / 2 + s * 0.1); ctx.lineTo(x + s * 0.15, y + mh / 2 + s * 0.1); ctx.stroke();
    };

    const drawIcon = (x: number, y: number, s: number, color: string, icon: string) => {
      switch (icon) {
        case "laptop": drawLaptopIcon(x, y, s, color); break;
        case "printer": drawPrinterIcon(x, y, s, color); break;
        case "forklift": drawForkliftIcon(x, y, s, color); break;
        case "projector": drawProjectorIcon(x, y, s, color); break;
        case "mobile": drawMobileIcon(x, y, s, color); break;
        case "monitor": drawMonitorIcon(x, y, s, color); break;
      }
    };

    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
    };

    const drawCenterHub = (cx: number, cy: number) => {
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      glow.addColorStop(0, "rgba(66, 153, 225, 0.18)");
      glow.addColorStop(0.4, "rgba(99, 102, 241, 0.08)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 65, cy - 65, 130, 130);

      drawRoundedRect(cx - 22, cy - 22, 44, 44, 12);
      const hubGrad = ctx.createLinearGradient(cx - 22, cy - 22, cx + 22, cy + 22);
      hubGrad.addColorStop(0, "rgba(66, 153, 225, 0.7)");
      hubGrad.addColorStop(1, "rgba(99, 102, 241, 0.7)");
      ctx.fillStyle = hubGrad; ctx.fill();
      ctx.strokeStyle = "rgba(66, 153, 225, 0.3)"; ctx.lineWidth = 1; ctx.stroke();

      // WiFi icon
      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy + 4, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill();
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath(); ctx.arc(cx, cy + 4, 6 * i, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.strokeStyle = `rgba(255,255,255,${0.9 - i * 0.2})`; ctx.stroke();
      }

      // Rotating scan arc
      ctx.beginPath(); ctx.arc(cx, cy, 30, t * 2, t * 2 + 1);
      ctx.strokeStyle = "rgba(66, 153, 225, 0.2)"; ctx.lineWidth = 2; ctx.stroke();
    };

    const drawStatusTicker = (w: number, h: number) => {
      const tickerY = h - 24, tickerH = 20;
      drawRoundedRect(w * 0.1, tickerY, w * 0.8, tickerH, 10);
      ctx.fillStyle = "rgba(10, 15, 46, 0.85)"; ctx.fill();
      ctx.strokeStyle = "rgba(66, 153, 225, 0.12)"; ctx.lineWidth = 0.8; ctx.stroke();

      const items = [
        { label: "Active", count: 142, color: "#48bb78" },
        { label: "Maintenance", count: 8, color: "#ecc94b" },
        { label: "Damaged", count: 3, color: "#f56565" },
        { label: "Available", count: 47, color: "#4299e1" },
      ];
      const startX = w * 0.15, spacing = (w * 0.7) / items.length;
      ctx.font = "600 8px 'Plus Jakarta Sans', sans-serif";
      items.forEach((item, i) => {
        const ix = startX + spacing * i, iy = tickerY + tickerH / 2;
        ctx.beginPath(); ctx.arc(ix, iy, 3, 0, Math.PI * 2); ctx.fillStyle = item.color; ctx.fill();
        ctx.fillStyle = "rgba(160, 174, 192, 0.8)"; ctx.textAlign = "left";
        ctx.fillText(`${item.label}: ${item.count}`, ix + 7, iy + 3);
      });
    };

    const draw = () => {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5, cy = h * 0.46;
      const orbitRadius = Math.min(w, h) * 0.36;

      // Background glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbitRadius * 1.5);
      glow.addColorStop(0, "rgba(66, 153, 225, 0.06)");
      glow.addColorStop(0.5, "rgba(66, 153, 225, 0.02)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

      // Orbit ring (circular)
      ctx.beginPath(); ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(66, 153, 225, 0.08)"; ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]); ctx.stroke(); ctx.setLineDash([]);

      // Inner orbit ring
      ctx.beginPath(); ctx.arc(cx, cy, orbitRadius * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(66, 153, 225, 0.06)"; ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]); ctx.stroke(); ctx.setLineDash([]);

      // Spinning bright point on outer ring
      const spinAngle = t * 0.6;
      const spx = cx + Math.cos(spinAngle) * orbitRadius;
      const spy = cy + Math.sin(spinAngle) * orbitRadius;
      ctx.beginPath(); ctx.arc(spx, spy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(66, 153, 225, 0.6)"; ctx.fill();
      const pingR = 3 + (t * 3 % 20);
      const pingA = Math.max(0, 0.4 - (t * 3 % 20) / 50);
      ctx.beginPath(); ctx.arc(spx, spy, pingR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(66, 153, 225, ${pingA})`; ctx.lineWidth = 1; ctx.stroke();

      // Center hub
      drawCenterHub(cx, cy);

      // Orbiting asset nodes (circular)
      for (let i = 0; i < NODES.length; i++) {
        const node = NODES[i];
        const angle = node.angle + t * node.speed;
        const nx = cx + Math.cos(angle) * orbitRadius;
        const ny = cy + Math.sin(angle) * orbitRadius;

        // Connection line to center
        ctx.beginPath(); ctx.setLineDash([4, 4]);
        ctx.moveTo(cx, cy); ctx.lineTo(nx, ny);
        const lineAlpha = 0.08 + Math.sin(t * 2 + i * 1.2) * 0.06;
        ctx.strokeStyle = `rgba(66, 153, 225, ${lineAlpha})`; ctx.lineWidth = 1;
        ctx.stroke(); ctx.setLineDash([]);

        // Data packet
        const packetT = (Math.sin(t * 1.5 + i * 2) + 1) / 2;
        const packetX = cx + (nx - cx) * packetT;
        const packetY = cy + (ny - cy) * packetT;
        ctx.beginPath(); ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color; ctx.fill();

        // Glow
        const glowR = 22 + Math.sin(t * 2 + i) * 3;
        const glowGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowR);
        glowGrad.addColorStop(0, node.color + "22"); glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad; ctx.beginPath(); ctx.arc(nx, ny, glowR, 0, Math.PI * 2); ctx.fill();

        // Icon bg circle
        ctx.beginPath(); ctx.arc(nx, ny, 18, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(10, 15, 46, 0.92)"; ctx.fill();
        ctx.strokeStyle = node.color + "66"; ctx.lineWidth = 1.2; ctx.stroke();

        // Icon
        drawIcon(nx, ny, 32, node.color, node.icon);

        // Pulse ring
        const pulsePhase = (t * 0.8 + i) % 2;
        const pulseAlpha = 0.3 * (1 - pulsePhase / 2);
        const pulseR = 18 + pulsePhase * 12;
        if (pulseAlpha > 0) {
          ctx.beginPath(); ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = `${node.color}${Math.round(Math.max(0, pulseAlpha) * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = 1; ctx.stroke();
        }
      }

      // Status ticker
      drawStatusTicker(w, h);

      t += 0.016;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />;
}
