import { useRef, useEffect } from "react";

interface AssetNode {
  label: string;
  color: string;
  statusColor: string;
  // Fixed position as percentage of canvas
  px: number;
  py: number;
  icon: "laptop" | "printer" | "forklift" | "projector" | "mobile" | "monitor";
}

const NODES: AssetNode[] = [
  { label: "Laptop", color: "#4299e1", statusColor: "#4299e1", px: 0.15, py: 0.18, icon: "laptop" },
  { label: "Printer", color: "#48bb78", statusColor: "#48bb78", px: 0.82, py: 0.22, icon: "printer" },
  { label: "Forklift", color: "#f56565", statusColor: "#f56565", px: 0.12, py: 0.72, icon: "forklift" },
  { label: "Projector", color: "#ecc94b", statusColor: "#ecc94b", px: 0.78, py: 0.68, icon: "projector" },
  { label: "Mobile", color: "#9f7aea", statusColor: "#9f7aea", px: 0.5, py: 0.12, icon: "mobile" },
  { label: "Monitor", color: "#06b6d4", statusColor: "#06b6d4", px: 0.85, py: 0.45, icon: "monitor" },
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

    // --- Icon drawing functions ---
    const drawLaptopIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      // Screen
      const sw = s * 0.7, sh = s * 0.45;
      ctx.beginPath();
      ctx.rect(x - sw / 2, y - sh / 2 - s * 0.08, sw, sh);
      ctx.stroke();
      // Base
      ctx.beginPath();
      ctx.moveTo(x - sw / 2 - s * 0.1, y + sh / 2 - s * 0.08);
      ctx.lineTo(x + sw / 2 + s * 0.1, y + sh / 2 - s * 0.08);
      ctx.stroke();
      // Screen content line
      ctx.strokeStyle = color + "66";
      ctx.beginPath();
      ctx.moveTo(x - sw / 4, y - s * 0.12);
      ctx.lineTo(x + sw / 4, y - s * 0.12);
      ctx.stroke();
    };

    const drawPrinterIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      const bw = s * 0.6, bh = s * 0.35;
      // Body
      ctx.beginPath();
      ctx.rect(x - bw / 2, y - bh / 2, bw, bh);
      ctx.stroke();
      // Paper tray top
      const pw = s * 0.4;
      ctx.beginPath();
      ctx.rect(x - pw / 2, y - bh / 2 - s * 0.18, pw, s * 0.18);
      ctx.stroke();
      // Paper output
      ctx.beginPath();
      ctx.moveTo(x - pw / 2, y + bh / 2);
      ctx.lineTo(x - pw / 2, y + bh / 2 + s * 0.15);
      ctx.lineTo(x + pw / 2, y + bh / 2 + s * 0.15);
      ctx.lineTo(x + pw / 2, y + bh / 2);
      ctx.stroke();
      // Detail dot
      ctx.beginPath();
      ctx.arc(x + bw / 4, y - bh / 4, 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    };

    const drawForkliftIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      // Body
      ctx.beginPath();
      ctx.rect(x - s * 0.2, y - s * 0.3, s * 0.4, s * 0.35);
      ctx.stroke();
      // Forks
      ctx.beginPath();
      ctx.moveTo(x + s * 0.2, y + s * 0.05);
      ctx.lineTo(x + s * 0.4, y + s * 0.05);
      ctx.lineTo(x + s * 0.4, y + s * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.2, y + s * 0.15);
      ctx.lineTo(x + s * 0.35, y + s * 0.15);
      ctx.lineTo(x + s * 0.35, y + s * 0.3);
      ctx.stroke();
      // Wheels
      ctx.beginPath();
      ctx.arc(x - s * 0.1, y + s * 0.1, s * 0.07, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + s * 0.1, y + s * 0.1, s * 0.07, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawProjectorIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      // Body
      const bw = s * 0.65, bh = s * 0.3;
      ctx.beginPath();
      ctx.rect(x - bw / 2, y - bh / 2, bw, bh);
      ctx.stroke();
      // Lens
      ctx.beginPath();
      ctx.arc(x + bw / 2, y, s * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      // Light beam
      ctx.strokeStyle = color + "44";
      ctx.beginPath();
      ctx.moveTo(x + bw / 2 + s * 0.12, y - s * 0.08);
      ctx.lineTo(x + bw / 2 + s * 0.35, y - s * 0.2);
      ctx.moveTo(x + bw / 2 + s * 0.12, y + s * 0.08);
      ctx.lineTo(x + bw / 2 + s * 0.35, y + s * 0.2);
      ctx.stroke();
    };

    const drawMobileIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      const pw = s * 0.3, ph = s * 0.55;
      // Body rounded
      const r = 3;
      ctx.beginPath();
      ctx.moveTo(x - pw / 2 + r, y - ph / 2);
      ctx.lineTo(x + pw / 2 - r, y - ph / 2);
      ctx.quadraticCurveTo(x + pw / 2, y - ph / 2, x + pw / 2, y - ph / 2 + r);
      ctx.lineTo(x + pw / 2, y + ph / 2 - r);
      ctx.quadraticCurveTo(x + pw / 2, y + ph / 2, x + pw / 2 - r, y + ph / 2);
      ctx.lineTo(x - pw / 2 + r, y + ph / 2);
      ctx.quadraticCurveTo(x - pw / 2, y + ph / 2, x - pw / 2, y + ph / 2 - r);
      ctx.lineTo(x - pw / 2, y - ph / 2 + r);
      ctx.quadraticCurveTo(x - pw / 2, y - ph / 2, x - pw / 2 + r, y - ph / 2);
      ctx.closePath();
      ctx.stroke();
      // Screen line
      ctx.beginPath();
      ctx.moveTo(x - pw / 2, y - ph / 2 + ph * 0.15);
      ctx.lineTo(x + pw / 2, y - ph / 2 + ph * 0.15);
      ctx.stroke();
      // Home button
      ctx.beginPath();
      ctx.arc(x, y + ph / 2 - s * 0.06, 2, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawMonitorIcon = (x: number, y: number, s: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      const mw = s * 0.65, mh = s * 0.4;
      ctx.beginPath();
      ctx.rect(x - mw / 2, y - mh / 2 - s * 0.05, mw, mh);
      ctx.stroke();
      // Stand
      ctx.beginPath();
      ctx.moveTo(x, y + mh / 2 - s * 0.05);
      ctx.lineTo(x, y + mh / 2 + s * 0.1);
      ctx.stroke();
      // Base
      ctx.beginPath();
      ctx.moveTo(x - s * 0.15, y + mh / 2 + s * 0.1);
      ctx.lineTo(x + s * 0.15, y + mh / 2 + s * 0.1);
      ctx.stroke();
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
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const drawAssetNode = (x: number, y: number, node: AssetNode, idx: number) => {
      const w = W(), h = H();
      const cx = w * 0.5, cy = h * 0.48;

      // Dashed connection line to center
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      const lineAlpha = 0.08 + Math.sin(t * 2 + idx * 1.2) * 0.06;
      ctx.strokeStyle = `rgba(66, 153, 225, ${lineAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulsing data packet
      const packetT = (Math.sin(t * 1.5 + idx * 2) + 1) / 2;
      const packetX = cx + (x - cx) * packetT;
      const packetY = cy + (y - cy) * packetT;
      ctx.beginPath();
      ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Glow behind icon
      const glowR = 22 + Math.sin(t * 2 + idx) * 3;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
      glow.addColorStop(0, node.color + "22");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Icon circle background
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 15, 46, 0.92)";
      ctx.fill();
      ctx.strokeStyle = node.color + "66";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Draw the device icon
      drawIcon(x, y, 32, node.color, node.icon);

      // Pulse ring
      const pulseAlpha = 0.3 * (1 - (t * 0.8 + idx) % 2 / 2);
      const pulseR = 18 + ((t * 0.8 + idx) % 2) * 12;
      if (pulseAlpha > 0) {
        ctx.beginPath();
        ctx.arc(x, y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = `${node.statusColor}${Math.round(Math.max(0, pulseAlpha) * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawOrbitRing = (cx: number, cy: number, radius: number) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * 0.55, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(66, 153, 225, 0.07)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Spinning bright point
      const spinAngle = t * 0.6;
      const px = cx + Math.cos(spinAngle) * radius;
      const py = cy + Math.sin(spinAngle) * radius * 0.55;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(66, 153, 225, 0.6)";
      ctx.fill();

      // Ping ring
      const pingR = 3 + (t * 3 % 20);
      const pingA = Math.max(0, 0.4 - (t * 3 % 20) / 50);
      ctx.beginPath();
      ctx.arc(px, py, pingR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(66, 153, 225, ${pingA})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawCenterHub = (cx: number, cy: number) => {
      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      glow.addColorStop(0, "rgba(66, 153, 225, 0.18)");
      glow.addColorStop(0.4, "rgba(99, 102, 241, 0.08)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 65, cy - 65, 130, 130);

      // Hub rounded square
      drawRoundedRect(cx - 22, cy - 22, 44, 44, 12);
      const hubGrad = ctx.createLinearGradient(cx - 22, cy - 22, cx + 22, cy + 22);
      hubGrad.addColorStop(0, "rgba(66, 153, 225, 0.7)");
      hubGrad.addColorStop(1, "rgba(99, 102, 241, 0.7)");
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(66, 153, 225, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // WiFi/signal icon inside hub
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy + 4, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();
      // Arcs
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy + 4, 6 * i, -Math.PI * 0.75, -Math.PI * 0.25);
        ctx.strokeStyle = `rgba(255,255,255,${0.9 - i * 0.2})`;
        ctx.stroke();
      }

      // Rotating scan arc
      ctx.beginPath();
      ctx.arc(cx, cy, 30, t * 2, t * 2 + 1);
      ctx.strokeStyle = "rgba(66, 153, 225, 0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawStatusTicker = (w: number, h: number) => {
      const tickerY = h - 24;
      const tickerH = 20;

      drawRoundedRect(w * 0.1, tickerY, w * 0.8, tickerH, 10);
      ctx.fillStyle = "rgba(10, 15, 46, 0.85)";
      ctx.fill();
      ctx.strokeStyle = "rgba(66, 153, 225, 0.12)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      const items = [
        { label: "Active", count: 142, color: "#48bb78" },
        { label: "Maintenance", count: 8, color: "#ecc94b" },
        { label: "Damaged", count: 3, color: "#f56565" },
        { label: "Available", count: 47, color: "#4299e1" },
      ];

      const startX = w * 0.15;
      const spacing = (w * 0.7) / items.length;

      ctx.font = "600 8px 'Plus Jakarta Sans', sans-serif";
      items.forEach((item, i) => {
        const ix = startX + spacing * i;
        const iy = tickerY + tickerH / 2;
        ctx.beginPath();
        ctx.arc(ix, iy, 3, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.fillStyle = "rgba(160, 174, 192, 0.8)";
        ctx.textAlign = "left";
        ctx.fillText(`${item.label}: ${item.count}`, ix + 7, iy + 3);
      });
    };

    const draw = () => {
      const w = W();
      const h = H();
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.48;

      // Background glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.6);
      glow.addColorStop(0, "rgba(66, 153, 225, 0.06)");
      glow.addColorStop(0.5, "rgba(66, 153, 225, 0.02)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Orbit rings
      const orbitR = Math.min(w, h) * 0.38;
      drawOrbitRing(cx, cy, orbitR);
      drawOrbitRing(cx, cy, orbitR * 0.65);

      // Center hub
      drawCenterHub(cx, cy);

      // Asset nodes at fixed positions (no overlap)
      for (let i = 0; i < NODES.length; i++) {
        const node = NODES[i];
        // Slight float animation without causing overlap
        const floatX = Math.sin(t * 0.5 + i * 1.5) * 3;
        const floatY = Math.cos(t * 0.4 + i * 1.8) * 3;
        const nx = w * node.px + floatX;
        const ny = h * node.py + floatY;
        drawAssetNode(nx, ny, node, i);
      }

      // Status ticker
      drawStatusTicker(w, h);

      t += 0.016;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}
