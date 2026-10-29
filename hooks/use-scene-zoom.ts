"use client";
import { useEffect, useRef, type RefObject } from "react";
import { clampZoom } from "@/components/three/animation/scene-zoom.mjs";
export function useSceneZoom(canvas: HTMLCanvasElement, ready: RefObject<boolean>, steps: number, resetKey: number, invalidate: () => void, enabled=true) {
  const zoom = useRef(0), previous = useRef({ steps, resetKey });
  useEffect(() => {
    if(enabled)zoom.current = previous.current.resetKey !== resetKey ? 0 : clampZoom(zoom.current - (steps - previous.current.steps) * .15);
    previous.current = { steps, resetKey }; invalidate();
  }, [steps, resetKey, invalidate, enabled]);
  useEffect(() => {
    const touches = new Map<number, { x: number; y: number }>();
    let distance = 0;
    const wheel = (event: WheelEvent) => {
      if (!ready.current) return;
      event.preventDefault();
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1);
      zoom.current = clampZoom(zoom.current + Math.max(-200, Math.min(200, pixels)) * .0014); invalidate();
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType === "touch") { touches.set(event.pointerId, {x:event.clientX,y:event.clientY}); distance = 0; }
    };
    const move = (event: PointerEvent) => {
      if (!touches.has(event.pointerId)) return;
      touches.set(event.pointerId, {x:event.clientX,y:event.clientY});
      if (touches.size !== 2 || !ready.current) return;
      const [a,b] = [...touches.values()];
      const next = Math.hypot(a.x-b.x,a.y-b.y);
      if (distance > 0 && next > 0) { zoom.current = clampZoom(zoom.current - Math.log(next/distance)); invalidate(); }
      distance = next;
    };
    const up = (event: PointerEvent) => { touches.delete(event.pointerId); distance = 0; };
    canvas.addEventListener("wheel",wheel,{passive:false}); canvas.addEventListener("pointerdown",down); canvas.addEventListener("pointermove",move);
    window.addEventListener("pointerup",up); window.addEventListener("pointercancel",up);
    return () => { canvas.removeEventListener("wheel",wheel); canvas.removeEventListener("pointerdown",down); canvas.removeEventListener("pointermove",move); window.removeEventListener("pointerup",up); window.removeEventListener("pointercancel",up); };
  }, [canvas, ready, invalidate]);
  return zoom;
}
