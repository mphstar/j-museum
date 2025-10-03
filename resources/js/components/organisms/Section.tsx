import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FancyButton } from '../atoms/FancyButton';
import Flip from '../FlipText';


export type SectionData = {
    id: string;
    title: string;
    navLabel?: string;
    subtitle?: string;
    bg?: string;
    content?: React.ReactNode;
    ctaHref?: string;
    overlays?: {
        url: string;
        position_horizontal: 'left' | 'center' | 'right' | null;
        position_vertical: 'top' | 'center' | 'bottom' | null;
        object_fit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down' | 'crop' | null;
    }[];
    align?: 'left' | 'right';
};

export const Section = forwardRef<HTMLDivElement, { data: SectionData; index: number }>(({ data, index }, ref) => {
    const { bg, title, subtitle, content, ctaHref, overlays, align = 'left' } = data;
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = sectionRef;
    const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const scrollProg = useRef(0); const lastTime = useRef<number | null>(null);
    const inView = useInView(sectionRef, { amount: 0.55 }); const prev = useRef(false); const [cycle, setCycle] = useState(0);
    useEffect(() => { const el = sectionRef.current; if (!el) return; const container = el.parentElement; if (!container) return; let ticking = false; const calc = () => { ticking = false; const h = container.clientHeight; const top = el.offsetTop; const start = top - h; const end = top + el.offsetHeight; const st = container.scrollTop; const p = (st - start) / (end - start); scrollProg.current = Math.min(1, Math.max(0, p)); }; const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(calc); } }; container.addEventListener('scroll', onScroll, { passive: true }); calc(); return () => container.removeEventListener('scroll', onScroll); }, []);
    useEffect(() => {
        let raf: number | null = null; const lerp = (a: number, b: number, n: number) => a + (b - a) * n; const loop = () => {
            pos.current.x = lerp(pos.current.x, pos.current.tx, 0.12); pos.current.y = lerp(pos.current.y, pos.current.ty, 0.12); const el = overlayRef.current; if (el) { const w = el.clientWidth || 1; const h = el.clientHeight || 1; const rx = pos.current.x / w - 0.5; const ry = pos.current.y / h - 0.5; const now = performance.now(); if (lastTime.current == null) lastTime.current = now; const t = now / 1000; const driftX = Math.sin(t * 0.35) * 12; const driftY = Math.cos(t * 0.28) * 10; const sShift = (scrollProg.current - 0.5) * 50; el.style.setProperty('--ox', pos.current.x + 'px'); el.style.setProperty('--oy', pos.current.y + 'px'); el.style.setProperty('--oxp', rx.toFixed(4)); el.style.setProperty('--oyp', ry.toFixed(4)); el.style.setProperty('--dx', driftX.toFixed(2)); el.style.setProperty('--dy', driftY.toFixed(2)); el.style.setProperty('--sShift', sShift.toFixed(2) + 'px'); }
            raf = requestAnimationFrame(loop);
        }; raf = requestAnimationFrame(loop); return () => { if (raf) cancelAnimationFrame(raf); }
    }, []);
    useEffect(() => { if (inView && !prev.current) { setCycle(c => c + 1); } prev.current = inView; }, [inView]);
    const handleMove = (e: React.MouseEvent) => { if (!window.matchMedia('(pointer:fine)').matches) return; const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); pos.current.tx = e.clientX - rect.left; pos.current.ty = e.clientY - rect.top; };
    return (
        <section id={data.id} ref={(el: HTMLDivElement | null) => { sectionRef.current = el; if (typeof ref === 'function') ref(el as any); else if (ref && 'current' in ref) (ref as any).current = el; }} onMouseMove={handleMove} className={`h-screen w-screen snap-start relative isolate flex items-center bg-black ${align === 'right' ? 'justify-end pr-8 md:pr-16' : 'justify-start pl-8 md:pl-16'}`}>
            {/* Black background layer to prevent unwanted images showing through */}
            <div className="absolute inset-0 -z-20 bg-black" />
            {bg && (
                <motion.div 
                    className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-black" 
                    style={{ backgroundImage: `url(${bg})` }} 
                    initial={{ scale: 1.05 }}
                    whileInView={{ scale: 1 }}
                    exit={{ scale: 1.05 }}
                    viewport={{ amount: 0.3, once: false }}
                    transition={{ 
                        duration: 1.2, 
                        ease: "easeOut"
                    }}
                    role="img" 
                    aria-label={title} 
                />
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />
            {overlays && overlays.length > 0 && (
                <motion.div 
                    key={cycle} 
                    className="absolute inset-0 -z-[8] pointer-events-none select-none overlay-container" 
                    initial={{ scale: 1.08 }}
                    whileInView={{ scale: 1 }}
                    exit={{ scale: 1.08 }}
                    viewport={{ amount: 0.3, once: false }}
                    transition={{ 
                        duration: 1.2, 
                        ease: "easeOut"
                    }}
                >
                    {overlays.map((overlay, i) => {
                        // Placement logic using position_horizontal and position_vertical
                        let stylePos: React.CSSProperties = {};
                        if (overlay.position_horizontal && overlay.position_vertical) {
                          if (overlay.position_horizontal === 'center' && overlay.position_vertical === 'center') {
                            stylePos = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
                          } else {
                            if (overlay.position_vertical === 'top') stylePos.top = 0;
                            if (overlay.position_vertical === 'center') stylePos.top = '50%';
                            if (overlay.position_vertical === 'bottom') stylePos.bottom = 0;
                            if (overlay.position_horizontal === 'left') stylePos.left = 0;
                            if (overlay.position_horizontal === 'center') stylePos.left = '50%';
                            if (overlay.position_horizontal === 'right') stylePos.right = 0;
                            if (overlay.position_horizontal === 'center' && overlay.position_vertical !== 'center') stylePos.transform = 'translateX(-50%)';
                            if (overlay.position_vertical === 'center' && overlay.position_horizontal !== 'center') stylePos.transform = 'translateY(-50%)';
                          }
                        }
                        return (
                          <div
                            key={i}
                            style={{
                              position: 'absolute',
                              backgroundImage: `url(${overlay.url})`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                              backgroundSize: overlay.object_fit || 'cover',
                              width: '180px', height: '180px',
                              ...stylePos,
                              willChange: 'transform',
                            }}
                            aria-hidden="true"
                          />
                        );
                    })}
                </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.6, once: false }} transition={{ duration: 0.6, ease: 'easeOut' }} className={`max-w-5xl w-full flex flex-col ${align === 'right' ? 'text-right items-end' : 'text-left items-start'}`}>
                {title.trim().split(/\s+/).map(w => <Flip key={w}>{w}</Flip>)}
                {subtitle && <p className="mt-4 text-white/90 md:text-xl font-light tracking-wide">{subtitle}</p>}
                {content && <div className={`mt-8 w-fit ${align === 'right' ? 'text-right' : 'text-left'}`}>{content}</div>}
                {ctaHref && <div className={`mt-10 ${align === 'right' ? 'flex justify-end' : 'flex justify-start'}`}><FancyButton href={ctaHref}>Lihat</FancyButton></div>}
            </motion.div>
            <div className="absolute bottom-6 left-6 text-white/60 font-mono">{String(index + 1).padStart(2, '0')}</div>
        </section>
    );
});
