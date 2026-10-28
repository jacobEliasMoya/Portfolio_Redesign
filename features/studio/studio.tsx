"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/atoms/button";
import { SectionHeading } from "@/components/ui/molecules/section-heading";
import { StudioHeader } from "@/components/ui/organisms/studio-header";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
const FoundationScene = dynamic(() => import("@/components/three/scenes/foundation-scene"), { ssr: false, loading: () => <div className="canvas-fallback" role="status">Preparing the preview…</div> });
export function Studio() {
  const [resetKey, setResetKey] = useState(0);
  const [still, setStill] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  return <main className="studio">
    <StudioHeader />
    <section className="studio-intro"><SectionHeading eyebrow="PIXEL ROOTS. NEW DIMENSIONS." title="A space to build." /><p>A foundation for the next Jacob Moya experience. Familiar pixels, with a little more depth.</p></section>
    <section className="viewport-panel" aria-label="3D design preview">
      <div className="viewport-caption"><span>01 / PIXEL STUDY</span><span>LIVE 3D</span></div>
      <FoundationScene reducedMotion={prefersReducedMotion || still} resetKey={resetKey} />
      <div className="viewport-toolbar"><p>Drag to orbit · Hover to lift · Scroll to zoom</p><div className="controls"><Button onClick={() => setResetKey((key) => key + 1)}>Reset view</Button><Button disabled={prefersReducedMotion} aria-pressed={prefersReducedMotion || still} onClick={() => setStill((value) => !value)}>Reduced motion: {prefersReducedMotion || still ? "on" : "off"}</Button></div></div>
    </section>
    <section className="foundations" aria-label="Design foundations">
      <article><p className="eyebrow">01 / TYPE</p><h2 className="type-specimen">Sabo</h2><p>Filled for presence. Outline for a lighter touch.</p><span className="outline-specimen">Aa / JM / 0123</span></article>
      <article><p className="eyebrow">02 / PALETTE</p><h2>Quiet space.</h2><div className="swatches"><span style={{ background: "var(--color-background)" }} title="Space" /><span style={{ background: "var(--color-metal)" }} title="Silver" /><span style={{ background: "var(--color-accent)" }} title="Signal" /></div><p>Space black. Silver. A small signal of green.</p></article>
      <article><p className="eyebrow">03 / MOVEMENT</p><h2>Room to breathe.</h2><p>Soft settling, deliberate interactions, and respect for reduced-motion preferences.</p></article>
    </section>
    <footer className="studio-footer">JACOB MOYA <span>THE NEXT CHAPTER IS TAKING SHAPE.</span></footer>
  </main>;
}
