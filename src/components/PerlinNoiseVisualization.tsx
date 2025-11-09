import { useEffect, useRef } from "react";

interface PerlinNoiseVisualizationProps {
  sentiment: number;
}

export const PerlinNoiseVisualization: React.FC<
  PerlinNoiseVisualizationProps
> = ({ sentiment = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const targetSentimentRef = useRef<number>(sentiment);
  const currentSentimentRef = useRef<number>(0);

  useEffect(() => {
    targetSentimentRef.current = sentiment;
  }, [sentiment]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // base pseudo-noise using sin waves
    const baseNoise = (x: number, y: number, t: number): number => {
      return (
        Math.sin(x * 0.01 + t) * 0.5 +
        Math.sin(y * 0.01 + t * 0.7) * 0.5 +
        Math.sin((x + y) * 0.005 + t * 0.5) * 0.5
      );
    };

    // fractal brownian motion (fbm)
    const fbm = (x: number, y: number, t: number, octaves = 4): number => {
      let value = 0;
      let amplitude = 0.6;
      let frequency = 1;
      let ampSum = 0;
      for (let i = 0; i < octaves; i++) {
        value +=
          baseNoise(x * frequency, y * frequency, t * frequency) * amplitude;
        ampSum += amplitude;
        frequency *= 2;
        amplitude *= 0.5;
      }
      return value / (ampSum || 1);
    };

    const animate = (): void => {
      timeRef.current += 0.0065;

      // Linear interpolation with fixed step size per frame
      const difference =
        targetSentimentRef.current - currentSentimentRef.current;
      const step = 0.02;

      if (Math.abs(difference) < step) {
        currentSentimentRef.current = targetSentimentRef.current;
      } else {
        currentSentimentRef.current += Math.sign(difference) * step;
      }

      const s = currentSentimentRef.current;

      let hue: number;
      let saturation: number;
      let lightness: number;

      const clampedS = Math.max(-1, Math.min(1, s));
      if (clampedS >= 0) {
        // Positive sentiment: Blue-Grey (210) to yellowish-green (70)
        const t = clampedS;
        hue = 210 - t * 140;
        saturation = 8 + t * 70;
        lightness = 38 + t * 19;
      } else {
        // Negative sentiment: Blue-Grey (210) to deeper blue (220)
        const t = Math.abs(clampedS);
        hue = 210 + t * 10;
        saturation = 8 + t * 85;
        lightness = 38 - t * 22;
      }

      const energy = 1 + Math.abs(s) * 2.2;

      ctx.fillStyle = `rgba(8, 10, 15, 0.12)`;
      ctx.fillRect(0, 0, width, height);

      const coarse = Math.max(18, Math.floor(40 - Math.abs(s) * 25));
      const fine = Math.max(6, Math.floor(12 - Math.abs(s) * 6));

      ctx.lineWidth = 1.2 + Math.abs(s) * 0.6;
      ctx.lineCap = "round";
      for (let x = 0; x < width; x += coarse) {
        for (let y = 0; y < height; y += coarse) {
          const n = fbm(x * 0.6, y * 0.6, timeRef.current, 3);
          const angle = n * Math.PI * 2 * energy;
          const length =
            (Math.abs(fbm(x + 100, y + 100, timeRef.current, 2)) + 0.4) *
            (12 + Math.abs(s) * 16);

          const endX = x + Math.cos(angle) * length;
          const endY = y + Math.sin(angle) * length;
          const alpha = 0.18 + Math.abs(n) * 0.45;

          ctx.beginPath();
          ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      ctx.lineWidth = 0.7 + Math.abs(s) * 0.3;
      for (let x = 0; x < width; x += fine) {
        for (let y = 0; y < height; y += fine) {
          const n = fbm(x * 1.6, y * 1.6, timeRef.current * 1.2, 4);
          const angle = n * Math.PI * 2 * energy * 0.6;
          const length =
            (Math.abs(fbm(x + 200, y + 200, timeRef.current, 2)) + 0.2) *
            (4 + Math.abs(s) * 6);
          const endX = x + Math.cos(angle) * length;
          const endY = y + Math.sin(angle) * length;
          const alpha = 0.06 + Math.abs(n) * 0.28;

          ctx.beginPath();
          ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${
            lightness + 2
          }%, ${alpha})`;
          ctx.moveTo(x, y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }

      const grain = Math.floor(200 * Math.min(1, 0.6 + Math.abs(s) * 0.8));
      for (let i = 0; i < grain; i += 12) {
        const px = Math.random() * width;
        const py = Math.random() * height;
        ctx.beginPath();
        const gAlpha = 0.02 + Math.random() * 0.03;
        ctx.fillStyle = `hsla(${hue}, ${Math.max(
          10,
          saturation - 10
        )}%, ${Math.min(90, lightness + 10)}%, ${gAlpha})`;
        ctx.fillRect(px, py, 1, 1);
      }

      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.2,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(6,10,18,0.55)");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = (): void => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        ctx.fillStyle = "#080a0f";
        ctx.fillRect(0, 0, width, height);
      }
    };

    // ensure canvas resizes with window
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full"
      style={{ background: "#080a0f" }}
    />
  );
};
