import { useRef, useEffect } from "react";

export function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Generate points on a sphere
    const points: { lat: number; lng: number }[] = [];
    const rows = 24;
    const cols = 48;
    for (let i = 0; i < rows; i++) {
      const lat = (Math.PI / rows) * i - Math.PI / 2;
      for (let j = 0; j < cols; j++) {
        const lng = ((2 * Math.PI) / cols) * j;
        points.push({ lat, lng });
      }
    }

    // Add some arc lines (equator + tropics)
    const arcPoints: { lat: number; lng: number }[][] = [];
    for (const latAngle of [-0.4, 0, 0.4]) {
      const arc: { lat: number; lng: number }[] = [];
      for (let j = 0; j <= 120; j++) {
        arc.push({ lat: latAngle, lng: ((2 * Math.PI) / 120) * j });
      }
      arcPoints.push(arc);
    }

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      const cx = W() * 0.5;
      const cy = H() * 0.5;
      const radius = Math.min(W(), H()) * 0.38;

      // Background glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.5);
      glow.addColorStop(0, "rgba(66, 153, 225, 0.08)");
      glow.addColorStop(0.5, "rgba(66, 153, 225, 0.03)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W(), H());

      // Draw arcs
      for (const arc of arcPoints) {
        ctx.beginPath();
        let started = false;
        for (const p of arc) {
          const x3d = Math.cos(p.lat) * Math.sin(p.lng + angle);
          const y3d = Math.sin(p.lat);
          const z3d = Math.cos(p.lat) * Math.cos(p.lng + angle);
          if (z3d < -0.1) { started = false; continue; }
          const px = cx + x3d * radius;
          const py = cy - y3d * radius;
          if (!started) { ctx.moveTo(px, py); started = true; }
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(66, 153, 225, 0.12)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw dots
      for (const p of points) {
        const x3d = Math.cos(p.lat) * Math.sin(p.lng + angle);
        const y3d = Math.sin(p.lat);
        const z3d = Math.cos(p.lat) * Math.cos(p.lng + angle);
        if (z3d < 0) continue; // back hemisphere

        const px = cx + x3d * radius;
        const py = cy - y3d * radius;
        const alpha = 0.15 + z3d * 0.65;
        const size = 1 + z3d * 1.5;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 179, 237, ${alpha})`;
        ctx.fill();
      }

      angle += 0.003;
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