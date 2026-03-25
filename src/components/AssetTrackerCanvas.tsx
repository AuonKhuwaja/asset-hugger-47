import { useRef, useEffect } from "react";

interface AssetNode {
  label: string;
  color: string;
  statusColor: string;
  angle: number;
  orbitRadius: number;
  speed: number;
  size: number;
}

const NODES: AssetNode[] = [
  { label: "Laptop", color: "#4299e1", statusColor: "#4299e1", angle: 0, orbitRadius: 0.32, speed: 0.006, size: 0.07 },
  { label: "Printer", color: "#48bb78", statusColor: "#48bb78", angle: 2.1, orbitRadius: 0.36, speed: 0.004, size: 0.06 },
  { label: "Forklift", color: "#f56565", statusColor: "#f56565", angle: 4.2, orbitRadius: 0.34, speed: 0.005, size: 0.06 },
  { label: "Projector", color: "#ecc94b", statusColor: "#ecc94b", angle: 1.05, orbitRadius: 0.28, speed: 0.007, size: 0.055 },
  { label: "Mobile", color: "#9f7aea", statusColor: "#9f7aea", angle: 3.5, orbitRadius: 0.30, speed: 0.0055, size: 0.055 },
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

    // QR code grid pattern
    const qrGrid = (() => {
      const cells: boolean[][] = [];
      const size = 9;
      for (let r = 0; r < size; r++) {
        cells[r] = [];
        for (let c = 0; c < size; c++) {
          // Corner markers
          if ((r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3)) {
            cells[r][c] = true;
          } else {
            cells[r][c] = Math.random() > 0.45;
          }
        }
      }
      return cells;
    })();

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

    const drawQRPanel = (cx: number, cy: number, size: number) => {
      // Panel background
      drawRoundedRect(cx - size / 2, cy - size / 2, size, size, 8);
      ctx.fillStyle = "rgba(10, 15, 46, 0.85)";
      ctx.fill();
      ctx.strokeStyle = "rgba(66, 153, 225, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // QR cells
      const padding = size * 0.15;
      const inner = size - padding * 2;
      const cellSize = inner / 9;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (qrGrid[r][c]) {
            ctx.fillStyle = "rgba(66, 153, 225, 0.7)";
            ctx.fillRect(
              cx - size / 2 + padding + c * cellSize + 1,
              cy - size / 2 + padding + r * cellSize + 1,
              cellSize - 2, cellSize - 2
            );
          }
        }
      }

      // Scanning beam
      const beamY = cy - size / 2 + padding + (inner * ((Math.sin(t * 1.5) + 1) / 2));
      ctx.beginPath();
      ctx.moveTo(cx - size / 2 + padding, beamY);
      ctx.lineTo(cx + size / 2 - padding, beamY);
      const beamGrad = ctx.createLinearGradient(cx - size / 2 + padding, 0, cx + size / 2 - padding, 0);
      beamGrad.addColorStop(0, "transparent");
      beamGrad.addColorStop(0.3, "rgba(66, 153, 225, 0.8)");
      beamGrad.addColorStop(0.7, "rgba(66, 153, 225, 0.8)");
      beamGrad.addColorStop(1, "transparent");
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Beam glow
      const glowGrad = ctx.createRadialGradient(cx, beamY, 0, cx, beamY, size * 0.4);
      glowGrad.addColorStop(0, "rgba(66, 153, 225, 0.12)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - size / 2, beamY - size * 0.3, size, size * 0.6);

      // Label
      ctx.fillStyle = "rgba(160, 174, 192, 0.7)";
      ctx.font = "600 9px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("QR SCANNER", cx, cy + size / 2 + 14);
    };

    const drawAssetNode = (
      x: number, y: number, node: AssetNode, w: number, h: number, pulse: number
    ) => {
      // Connection line to center
      const cxCenter = w * 0.5;
      const cyCenter = h * 0.48;

      // Dashed line
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(cxCenter, cyCenter);
      ctx.lineTo(x, y);
      const lineAlpha = 0.08 + Math.sin(t * 2 + node.angle) * 0.06;
      ctx.strokeStyle = `rgba(66, 153, 225, ${lineAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Pulsing data packet along line
      const packetT = (Math.sin(t * 1.5 + node.angle * 2) + 1) / 2;
      const packetX = cxCenter + (x - cxCenter) * packetT;
      const packetY = cyCenter + (y - cyCenter) * packetT;
      ctx.beginPath();
      ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Node card
      const cardW = 80;
      const cardH = 34;
      drawRoundedRect(x - cardW / 2, y - cardH / 2, cardW, cardH, 6);
      ctx.fillStyle = "rgba(10, 15, 46, 0.9)";
      ctx.fill();
      ctx.strokeStyle = `${node.color}44`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Status dot with pulse
      const dotX = x - cardW / 2 + 12;
      const dotY = y - 3;

      // Pulse ring
      const pulseAlpha = 0.3 * (1 - pulse % 1);
      const pulseR = 4 + (pulse % 1) * 8;
      ctx.beginPath();
      ctx.arc(dotX, dotY, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = `${node.statusColor}${Math.round(pulseAlpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Solid dot
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = node.statusColor;
      ctx.fill();

      // Lines (simulated content bars)
      ctx.fillStyle = "rgba(160, 174, 192, 0.4)";
      ctx.fillRect(x - cardW / 2 + 22, y - 7, 38, 3);
      ctx.fillStyle = "rgba(160, 174, 192, 0.25)";
      ctx.fillRect(x - cardW / 2 + 22, y, 28, 3);

      // Label
      ctx.fillStyle = node.color;
      ctx.font = "600 9px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.label, x, y + cardH / 2 + 12);
    };

    const drawOrbitRing = (cx: number, cy: number, radius: number) => {
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * 0.45, -0.15, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(66, 153, 225, 0.07)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Spinning bright point on ring
      const spinAngle = t * 0.8;
      const px = cx + Math.cos(spinAngle) * radius;
      const py = cy + Math.sin(spinAngle) * radius * 0.45;
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
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
      glow.addColorStop(0, "rgba(66, 153, 225, 0.15)");
      glow.addColorStop(0.5, "rgba(66, 153, 225, 0.05)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 60, cy - 60, 120, 120);

      // Hub circle
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(10, 15, 46, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(66, 153, 225, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner icon (crosshair-like)
      ctx.strokeStyle = "rgba(66, 153, 225, 0.7)";
      ctx.lineWidth = 1.5;
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx + 8, cy);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 8);
      ctx.stroke();
      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#4299e1";
      ctx.fill();

      // Rotating scan arc
      ctx.beginPath();
      ctx.arc(cx, cy, 24, t * 2, t * 2 + 1.2);
      ctx.strokeStyle = "rgba(66, 153, 225, 0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "rgba(160, 174, 192, 0.5)";
      ctx.font = "700 8px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("HUB", cx, cy + 32);
    };

    const drawStatusTicker = (w: number, h: number) => {
      const tickerY = h - 22;
      const tickerH = 20;

      // Background bar
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

        // Dot
        ctx.beginPath();
        ctx.arc(ix, iy, 3, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();

        // Text
        ctx.fillStyle = "rgba(160, 174, 192, 0.8)";
        ctx.textAlign = "left";
        ctx.fillText(`${item.label}: ${item.count}`, ix + 7, iy + 3);
      });
    };

    // Floating laptop with asset card
    const drawFloatingLaptop = (cx: number, cy: number, size: number) => {
      const floatOffset = Math.sin(t * 0.8) * 4;
      const ly = cy + floatOffset;

      // Laptop base (trapezoid-like)
      const baseW = size * 1.1;
      const baseH = size * 0.08;
      ctx.beginPath();
      ctx.moveTo(cx - baseW / 2 + 4, ly + size * 0.3 + baseH);
      ctx.lineTo(cx + baseW / 2 - 4, ly + size * 0.3 + baseH);
      ctx.lineTo(cx + baseW / 2 - 10, ly + size * 0.3);
      ctx.lineTo(cx - baseW / 2 + 10, ly + size * 0.3);
      ctx.closePath();
      ctx.fillStyle = "rgba(160, 174, 192, 0.25)";
      ctx.fill();

      // Screen
      const screenW = size * 0.85;
      const screenH = size * 0.55;
      drawRoundedRect(cx - screenW / 2, ly - screenH / 2 - 5, screenW, screenH, 4);
      ctx.fillStyle = "rgba(10, 15, 46, 0.95)";
      ctx.fill();
      ctx.strokeStyle = "rgba(237, 186, 52, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Screen content lines
      const contentX = cx - screenW / 2 + 8;
      const contentY = ly - screenH / 2 + 3;
      // Title bar
      ctx.fillStyle = "rgba(160, 174, 192, 0.5)";
      ctx.fillRect(contentX, contentY, screenW * 0.5, 3);
      // Content lines
      ctx.fillStyle = "rgba(160, 174, 192, 0.3)";
      ctx.fillRect(contentX, contentY + 7, screenW * 0.65, 2.5);
      ctx.fillRect(contentX, contentY + 13, screenW * 0.45, 2.5);
      // Status indicator
      ctx.beginPath();
      ctx.arc(contentX + 3, contentY + 21, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#48bb78";
      ctx.fill();
      ctx.fillStyle = "rgba(72, 187, 120, 0.3)";
      ctx.fillRect(contentX + 10, contentY + 19.5, screenW * 0.35, 3);
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
      const orbitR = Math.min(w, h) * 0.35;
      drawOrbitRing(cx, cy, orbitR);
      drawOrbitRing(cx, cy, orbitR * 0.7);

      // Center hub
      drawCenterHub(cx, cy);

      // QR panel (offset to one side)
      drawQRPanel(cx + w * 0.22, cy - h * 0.12, Math.min(w, h) * 0.18);

      // Floating laptop
      drawFloatingLaptop(cx - w * 0.2, cy + h * 0.08, Math.min(w, h) * 0.28);

      // Orbiting asset nodes
      for (const node of NODES) {
        const a = node.angle + t * node.speed * 60;
        const r = Math.min(w, h) * node.orbitRadius;
        const nx = cx + Math.cos(a) * r;
        const ny = cy + Math.sin(a) * r * 0.5; // elliptical
        const pulse = t * 1.5 + node.angle;
        drawAssetNode(nx, ny, node, w, h, pulse);
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
