"use client";

import { useRef, useEffect, useCallback } from "react";

const BLOCKS = "▁▂▃▄▅▆▇█";
const COLORS = [
  "#050505",
  "#042f2e",
  "#064e3b",
  "#065f46",
  "#047857",
  "#059669",
  "#10b981",
  "#34d399",
];

const CELL_W = 10;
const CELL_H = 14;
const TARGET_FPS = 15;
const NUM_COLS = 80;

export function AsciiWaveform(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const reducedMotion = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c = ctx;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = Math.floor(rect.width);
    const h = 80;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.height = `${h}px`;
    c.scale(dpr, dpr);

    const cols = Math.min(NUM_COLS, Math.floor(w / CELL_W));
    const rows = Math.floor(h / CELL_H);

    const phases = Array.from({ length: cols }, () => Math.random() * Math.PI * 2);
    const speeds = Array.from({ length: cols }, () => 0.3 + Math.random() * 0.7);
    const heights = Array.from({ length: cols }, () => 0);
    const targets = Array.from({ length: cols }, () => 0);

    let lastTime = 0;
    let tick = 0;

    function step(time: number): void {
      if (reducedMotion.current) return;

      if (time - lastTime < 1000 / TARGET_FPS) {
        animRef.current = requestAnimationFrame(step);
        return;
      }
      lastTime = time;
      tick++;

      for (let i = 0; i < cols; i++) {
        const t = tick * 0.05 * speeds[i] + phases[i];
        const wave1 = Math.sin(t) * 0.5 + 0.5;
        const wave2 = Math.sin(t * 1.7 + i * 0.3) * 0.3 + 0.5;
        const wave3 = Math.sin(t * 0.4 + i * 0.1) * 0.2 + 0.5;
        targets[i] = Math.min(1, (wave1 + wave2 + wave3) / 3 + Math.random() * 0.1);
        heights[i] += (targets[i] - heights[i]) * 0.15;
      }

      c.clearRect(0, 0, w, h);
      c.font = `${CELL_H - 2}px monospace`;
      c.textBaseline = "top";

      const xOffset = Math.floor((w - cols * CELL_W) / 2);

      for (let x = 0; x < cols; x++) {
        const colHeight = Math.floor(heights[x] * rows);
        for (let y = 0; y < rows; y++) {
          const rowFromBottom = rows - 1 - y;
          if (rowFromBottom >= colHeight) continue;

          const intensity = Math.min(
            BLOCKS.length - 1,
            Math.floor((rowFromBottom / Math.max(1, colHeight)) * (BLOCKS.length - 1)),
          );
          const blockChar = BLOCKS[colHeight <= 1 ? 0 : BLOCKS.length - 1 - intensity];
          const colorIdx = Math.min(
            COLORS.length - 1,
            Math.floor((rowFromBottom / rows) * COLORS.length),
          );

          c.fillStyle = COLORS[colorIdx];
          c.fillText(blockChar, xOffset + x * CELL_W, y * CELL_H);
        }
      }

      animRef.current = requestAnimationFrame(step);
    }

    animRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;

    function onChange(e: MediaQueryListEvent): void {
      reducedMotion.current = e.matches;
      if (e.matches) {
        cancelAnimationFrame(animRef.current);
        const canvas = canvasRef.current;
        if (canvas) {
          const c = canvas.getContext("2d");
          if (c) {
            c.fillStyle = "#050505";
            c.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      } else {
        draw();
      }
    }

    mq.addEventListener("change", onChange);

    if (!mq.matches) {
      draw();
    }

    return () => {
      mq.removeEventListener("change", onChange);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="ascii-waveform-canvas"
      aria-hidden="true"
    />
  );
}
