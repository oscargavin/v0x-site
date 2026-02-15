"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface AsciiBorderProps {
  children: ReactNode;
  className?: string;
}

export function AsciiBorder({ children, className }: AsciiBorderProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [charWidth, setCharWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = document.createElement("span");
    measure.style.fontFamily = "inherit";
    measure.style.fontSize = "inherit";
    measure.style.visibility = "hidden";
    measure.style.position = "absolute";
    measure.textContent = "═";
    containerRef.current.appendChild(measure);
    const w = measure.getBoundingClientRect().width;
    measure.remove();
    if (w > 0) setCharWidth(w);
  }, []);

  useEffect(() => {
    if (!containerRef.current || charWidth === 0) return;

    function update(): void {
      const el = containerRef.current;
      if (!el) return;
      const innerWidth = el.clientWidth;
      const count = Math.max(0, Math.floor(innerWidth / charWidth) - 2);
      el.style.setProperty("--border-repeat", `"${"═".repeat(count)}"`);
    }

    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [charWidth]);

  return (
    <div ref={containerRef} className={`ascii-border ${className ?? ""}`}>
      <div className="ascii-border-top" aria-hidden="true">
        <span className="ascii-corner">╔</span>
        <span className="ascii-edge" />
        <span className="ascii-corner">╗</span>
      </div>
      <div className="ascii-border-content">
        <span className="ascii-side" aria-hidden="true">║</span>
        <div className="ascii-border-inner">{children}</div>
        <span className="ascii-side" aria-hidden="true">║</span>
      </div>
      <div className="ascii-border-bottom" aria-hidden="true">
        <span className="ascii-corner">╚</span>
        <span className="ascii-edge" />
        <span className="ascii-corner">╝</span>
      </div>
    </div>
  );
}
