import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FancyButton } from '../atoms/FancyButton';
import { SectionData } from './Section';
import Flip from '../FlipText';

export const CarouselSection = forwardRef<HTMLDivElement, { data: SectionData; index: number; isActive: boolean }>(({ data, index, isActive }, ref) => {
    const { bg, title, subtitle, content, ctaHref, overlays, align = 'left' } = data;
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = sectionRef;
    const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
    const scrollProg = useRef(0); 
    const lastTime = useRef<number | null>(null);
    const inView = useInView(sectionRef, { amount: 0.55 }); 
    const prev = useRef(false); 
    const [cycle, setCycle] = useState(0);

    // Parallax mouse movement effect
    useEffect(() => {
        let raf: number | null = null; 
        const lerp = (a: number, b: number, n: number) => a + (b - a) * n; 
        const loop = () => {
            pos.current.x = lerp(pos.current.x, pos.current.tx, 0.12); 
            pos.current.y = lerp(pos.current.y, pos.current.ty, 0.12); 
            const el = overlayRef.current; 
            if (el) { 
                const w = el.clientWidth || 1; 
                const h = el.clientHeight || 1; 
                const rx = pos.current.x / w - 0.5; 
                const ry = pos.current.y / h - 0.5; 
                const now = performance.now(); 
                if (lastTime.current == null) lastTime.current = now; 
                const t = now / 1000; 
                const driftX = Math.sin(t * 0.35) * 12; 
                const driftY = Math.cos(t * 0.28) * 10; 
                el.style.setProperty('--ox', pos.current.x + 'px'); 
                el.style.setProperty('--oy', pos.current.y + 'px'); 
                el.style.setProperty('--oxp', rx.toFixed(4)); 
                el.style.setProperty('--oyp', ry.toFixed(4)); 
                el.style.setProperty('--dx', driftX.toFixed(2)); 
                el.style.setProperty('--dy', driftY.toFixed(2)); 
            }
            raf = requestAnimationFrame(loop);
        }; 
        raf = requestAnimationFrame(loop); 
        return () => { if (raf) cancelAnimationFrame(raf); }
    }, []);

    useEffect(() => { 
        if (isActive && !prev.current) { 
            setCycle(c => c + 1); 
        } 
        prev.current = isActive; 
    }, [isActive]);

    const handleMove = (e: React.MouseEvent) => { 
        if (!window.matchMedia('(pointer:fine)').matches) return; 
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); 
        pos.current.tx = e.clientX - rect.left; 
        pos.current.ty = e.clientY - rect.top; 
    };

    return (
        <div 
            id={data.id} 
            ref={(el: HTMLDivElement | null) => { 
                sectionRef.current = el; 
                if (typeof ref === 'function') ref(el as any); 
                else if (ref && 'current' in ref) (ref as any).current = el; 
            }} 
            onMouseMove={handleMove} 
            className={`h-full w-full flex-shrink-0 relative isolate flex items-center bg-black ${align === 'right' ? 'justify-end' : 'justify-start'}`}
        >
            {/* Black background layer */}
            <div className="absolute inset-0 -z-20 bg-black" />
            
            {bg && (
                <motion.div 
                    className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-black" 
                    style={{ backgroundImage: `url(${bg})` }} 
                    initial={{ scale: 1.05 }}
                    animate={isActive ? { scale: 1 } : { scale: 1.05 }}
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
                    animate={isActive ? { scale: 1 } : { scale: 1.08 }}
                    transition={{ 
                        duration: 1.2, 
                        ease: "easeOut"
                    }}
                >
                    {overlays.map((src, i) => { 
                        const depth = (i + 1) / overlays.length; 
                        const mul = 6 * depth; 
                        const driftMul = depth / 10; 
                        return (
                            <div 
                                key={i} 
                                style={{ 
                                    position: 'absolute', 
                                    inset: 0, 
                                    backgroundImage: `url(${src})`, 
                                    backgroundRepeat: 'no-repeat', 
                                    backgroundPosition: 'center', 
                                    backgroundSize: 'cover', 
                                    transform: `translate3d(calc(var(--oxp,0)*${mul}%) , calc(var(--oyp,0)*${mul}% + var(--dy,0)*${driftMul}),0) rotate(calc(var(--oxp,0)*${(depth * 5).toFixed(3)}deg)) scale(${(1 + depth * 0.05).toFixed(3)})`, 
                                    willChange: 'transform' 
                                }} 
                                aria-hidden="true" 
                            />
                        ); 
                    })}
                </motion.div>
            )}
            
            <motion.div 
                initial={{ opacity: 0, y: 24 }} 
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 12 }}
                transition={{ duration: 0.6, ease: 'easeOut' }} 
                className={`pl-4 md:pl-8 pr-4 md:pr-8 max-w-5xl w-full ${align === 'right' ? 'text-right mr-12' : 'text-left'}`}
            >
                {title.trim().split(/\s+/).map(w => <Flip key={w}>{w}</Flip>)}
                {subtitle && <p className="mt-4 text-white/90 md:text-xl font-light tracking-wide">{subtitle}</p>}
                {content && <div className="mt-8">{content}</div>}
                {ctaHref && <div className="mt-10"><FancyButton href={ctaHref}>Lihat</FancyButton></div>}
            </motion.div>
            
            <div className="absolute bottom-6 left-6 text-white/60 font-mono">{String(index + 1).padStart(2, '0')}</div>
        </div>
    );
});

CarouselSection.displayName = 'CarouselSection';