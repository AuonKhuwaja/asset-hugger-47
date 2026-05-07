import { useRef, useEffect } from "react";

interface AssetNode {
  label: string;
  color: string;
  angle: number;
  speed: number;
  icon: "laptop" | "printer" | "forklift" | "projector" | "mobile" | "monitor";
}

const NODES: AssetNode[] = [
  { label: "Laptop", color: "#60A5FA", angle: 0, speed: 0.18, icon: "laptop" },
  { label: "Printer", color: "#34D399", angle: Math.PI / 3, speed: 0.15, icon: "printer" },
  { label: "Forklift", color: "#F87171", angle: (2 * Math.PI) / 3, speed: 0.2, icon: "forklift" },
  { label: "Projector", color: "#FBBF24", angle: Math.PI, speed: 0.16, icon: "projector" },
  { label: "Mobile", color: "#A78BFA", angle: (4 * Math.PI) / 3, speed: 0.19, icon: "mobile" },
  { label: "Monitor", color: "#22D3EE", angle: (5 * Math.PI) / 3, speed: 0.14, icon: "monitor" },
];

export function AssetTrackerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;

      ctx.setTransform(
        window.devicePixelRatio,
        0,
        0,
        window.devicePixelRatio,
        0,
        0
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // ------------------------
    // ICONS
    // ------------------------

    const drawLaptop = (x: number, y: number, s: number, c: string) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(x - s * 0.3, y - s * 0.2, s * 0.6, s * 0.35, 4);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - s * 0.4, y + s * 0.2);
      ctx.lineTo(x + s * 0.4, y + s * 0.2);
      ctx.stroke();
    };

    const drawPrinter = (x: number, y: number, s: number, c: string) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(x - s * 0.25, y - s * 0.12, s * 0.5, s * 0.3, 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.roundRect(x - s * 0.18, y - s * 0.28, s * 0.36, s * 0.12, 2);
      ctx.stroke();
    };

    const drawForklift = (x: number, y: number, s: number, c: string) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.rect(x - s * 0.18, y - s * 0.12, s * 0.28, s * 0.22);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + s * 0.12, y - s * 0.15);
      ctx.lineTo(x + s * 0.12, y + s * 0.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x - s * 0.1, y + s * 0.16, s * 0.05, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + s * 0.08, y + s * 0.16, s * 0.05, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawProjector = (x: number, y: number, s: number, c: string) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(x - s * 0.28, y - s * 0.12, s * 0.56, s * 0.24, 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x + s * 0.18, y, s * 0.05, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawMobile = (x: number, y: number, s: number, c: string) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(x - s * 0.14, y - s * 0.28, s * 0.28, s * 0.56, 5);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y + s * 0.2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    };

    const drawMonitor = (x: number, y: number, s: number, c: string) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(x - s * 0.3, y - s * 0.2, s * 0.6, s * 0.35, 3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.15);
      ctx.lineTo(x, y + s * 0.28);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - s * 0.12, y + s * 0.28);
      ctx.lineTo(x + s * 0.12, y + s * 0.28);
      ctx.stroke();
    };

    const drawIcon = (
      x: number,
      y: number,
      s: number,
      color: string,
      icon: string
    ) => {
      switch (icon) {
        case "laptop":
          drawLaptop(x, y, s, color);
          break;
        case "printer":
          drawPrinter(x, y, s, color);
          break;
        case "forklift":
          drawForklift(x, y, s, color);
          break;
        case "projector":
          drawProjector(x, y, s, color);
          break;
        case "mobile":
          drawMobile(x, y, s, color);
          break;
        case "monitor":
          drawMonitor(x, y, s, color);
          break;
      }
    };

    // ------------------------
    // MAIN DRAW
    // ------------------------

    const draw = () => {
      const w = W();
      const h = H();

      ctx.clearRect(0, 0, w, h);

      // BACKGROUND
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#050816");
      bg.addColorStop(1, "#0f172a");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // STARS
      for (let i = 0; i < 80; i++) {
        const sx = (i * 137) % w;
        const sy = (i * 91) % h;

        ctx.beginPath();
        ctx.arc(sx, sy, Math.random() * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fill();
      }

      const cx = w / 2;
      const cy = h / 2;

      const orbitRadius = Math.min(w, h) * 0.3;

      // CENTRAL GLOW
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 160);

      glow.addColorStop(0, "rgba(59,130,246,0.25)");
      glow.addColorStop(0.5, "rgba(139,92,246,0.08)");
      glow.addColorStop(1, "transparent");

      ctx.fillStyle = glow;

      ctx.beginPath();
      ctx.arc(cx, cy, 180, 0, Math.PI * 2);
      ctx.fill();

      // ORBIT RINGS
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;

      ctx.setLineDash([6, 8]);

      for (let i = 1; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, orbitRadius * i * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      // CENTER HUB
      const hubGrad = ctx.createLinearGradient(
        cx - 40,
        cy - 40,
        cx + 40,
        cy + 40
      );

      hubGrad.addColorStop(0, "#3B82F6");
      hubGrad.addColorStop(1, "#8B5CF6");

      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);

      ctx.fillStyle = hubGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // HUB TEXT
      ctx.fillStyle = "white";
      ctx.font = "600 12px sans-serif";
      ctx.textAlign = "center";

      ctx.fillText("TRACK", cx, cy - 2);
      ctx.fillText("VAULT", cx, cy + 14);

      // PARTICLES
      for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2 + t * 0.2;

        const px = cx + Math.cos(angle) * (orbitRadius + 40);
        const py = cy + Math.sin(angle) * (orbitRadius + 40);

        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fill();
      }

      // NODES
      NODES.forEach((node, i) => {
        const angle = node.angle + t * node.speed;

        const nx = cx + Math.cos(angle) * orbitRadius;
        const ny = cy + Math.sin(angle) * orbitRadius;

        // CONNECTION LINE
        const gradient = ctx.createLinearGradient(cx, cy, nx, ny);

        gradient.addColorStop(0, "rgba(255,255,255,0.03)");
        gradient.addColorStop(1, node.color + "66");

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // FLOATING DOT
        const move = (Math.sin(t * 2 + i) + 1) / 2;

        const dx = cx + (nx - cx) * move;
        const dy = cy + (ny - cy) * move;

        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);

        ctx.fillStyle = node.color;
        ctx.fill();

        // NODE GLOW
        const nodeGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, 40);

        nodeGlow.addColorStop(0, node.color + "55");
        nodeGlow.addColorStop(1, "transparent");

        ctx.fillStyle = nodeGlow;

        ctx.beginPath();
        ctx.arc(nx, ny, 40, 0, Math.PI * 2);
        ctx.fill();

        // NODE CIRCLE
        ctx.beginPath();
        ctx.arc(nx, ny, 22, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(15,23,42,0.95)";
        ctx.fill();

        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // ICON
        drawIcon(nx, ny, 32, node.color, node.icon);

        // LABEL
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "500 11px sans-serif";

        ctx.fillText(node.label, nx, ny + 40);

        // PULSE
        const pulse = ((t * 0.5 + i) % 1) * 20;

        ctx.beginPath();
        ctx.arc(nx, ny, 22 + pulse, 0, Math.PI * 2);

        ctx.strokeStyle = `rgba(255,255,255,${0.15 - pulse / 150})`;

        ctx.lineWidth = 1;
        ctx.stroke();
      });

      t += 0.01;

      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full rounded-3xl"
      style={{
        display: "block",
      }}
    />
  );
}