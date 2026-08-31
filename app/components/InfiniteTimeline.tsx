"use client";

import { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent, useRef, useState } from "react";
import { ERAS } from "../game/data";

export function eraAt(index: number) {
  return ERAS[((index % ERAS.length) + ERAS.length) % ERAS.length];
}

export default function InfiniteTimeline({ index, onChange }: { index: number; onChange: (next: number) => void }) {
  const drag = useRef({ active: false, startX: 0, moved: false });
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const lastWheel = useRef(0);
  const itemWidth = 126;

  const finish = (rawOffset = offset) => {
    if (!drag.current.active) return;
    drag.current.active = false; setDragging(false);
    const steps = Math.round(-rawOffset / itemWidth);
    if (steps) onChange(index + steps);
    setOffset(0);
  };
  const start = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, startX: event.clientX, moved: false };
    setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const next = event.clientX - drag.current.startX;
    if (Math.abs(next) > 5) drag.current.moved = true;
    setOffset(next);
  };
  const wheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault(); const now = performance.now();
    if (now - lastWheel.current < 180) return;
    lastWheel.current = now;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (delta) onChange(index + (delta > 0 ? 1 : -1));
  };

  return <div className="infinite-timeline"><div className={`timeline-wheel ${dragging ? "dragging" : ""}`} onPointerDown={start} onPointerMove={move} onPointerUp={() => finish()} onPointerCancel={() => finish(0)} onWheel={wheel} role="slider" tabIndex={0} aria-label="Timeline melingkar tanpa ujung" aria-valuetext={`${eraAt(index).label}, ${eraAt(index).year}`} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); onChange(index + 1); } if (event.key === "ArrowLeft") { event.preventDefault(); onChange(index - 1); } }}><div className="timeline-wheel-track">{Array.from({ length: 13 }, (_, slotIndex) => slotIndex - 6).map(slot => { const era = eraAt(index + slot); return <button key={`${index}-${slot}`} className={slot === 0 ? "active" : ""} style={{ transform: `translateX(calc(-50% + ${slot * itemWidth + offset}px))` }} onClick={event => { event.stopPropagation(); if (!drag.current.moved && slot) onChange(index + slot); }}><small>{era.year}</small><strong>{era.label}</strong></button>; })}</div><i className="timeline-cursor" /></div><div className="timeline-hint"><span>‹ GESER KE MASA LALU</span><b>∞</b><span>GESER KE MASA DEPAN ›</span></div></div>;
}

