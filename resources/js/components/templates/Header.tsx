import { Link } from '@inertiajs/react';
import { Logo } from '../atoms/Logo';
import type { SectionData } from '../organisms/Section';
import React from 'react';

interface HeaderProps {
  active: number;
  onJump: (i:number)=>void;
  sections: SectionData[];
  brand?: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function Header({active,onJump,sections,brand,backHref,actions}:HeaderProps){
  const label = brand || 'Education';
  return (
  <div className="fixed w-full top-0 z-[60] px-3 md:px-8 py-3 border-b border-white/10">
      {/* Mobile layout */}
      <div className="md:hidden relative flex items-center h-10">
        {/* Left: back button or logo when no back */}
        <div className="flex items-center">
          {backHref ? (
            <Link href={backHref} className="group inline-flex items-center gap-1.5 px-2 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition" aria-label="Kembali">
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </Link>
          ) : (
            <a href="#intro" onClick={(e)=>{e.preventDefault(); onJump(0);}} className="inline-flex items-center">
              <Logo />
            </a>
          )}
        </div>
        {/* Center: title */}
        <div className="absolute inset-x-0 flex justify-center pointer-events-none px-12">
          <span className="pointer-events-auto max-w-[65%] truncate text-center text-white font-semibold tracking-wide text-sm">{label}</span>
        </div>
        {/* Right: logo if back exists, otherwise spacer */}
        <div className="ml-auto flex items-center">
          {backHref ? (
            <a href="#intro" onClick={(e)=>{e.preventDefault(); onJump(0);}} className="inline-flex items-center">
              <Logo />
            </a>
          ) : (
            <span className="inline-block w-9" />
          )}
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center gap-6">
        {backHref && (
          <Link href={backHref} className="group inline-flex items-center gap-1.5 pl-2 pr-3 h-9 rounded-md border border-white/15 bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs font-medium tracking-wide transition" aria-label="Kembali ke daftar">
            <svg className="h-4 w-4 -ml-0.5 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            <span className="hidden sm:inline">Kembali</span>
          </Link>
        )}
        <a href="#intro" className="flex items-center gap-2 group" onClick={(e)=>{e.preventDefault(); onJump(0);}}>
          <Logo />
          <span className="text-white font-semibold tracking-wide text-base group-hover:opacity-90">{label}</span>
        </a>
        {/* <nav className="flex gap-5 text-sm">
          {sections.map((s,i)=>{
            const lab = s.navLabel || s.title.split(' ')[0];
            return (
              <button key={s.id} onClick={()=>onJump(i)} className={`relative text-white/65 hover:text-white transition font-medium after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-white after:rounded-full after:transition-[width,opacity] after:opacity-70 ${i===active?'after:w-full text-white':'after:w-0 hover:after:w-full'}`} aria-current={i===active? 'true':undefined}>
                {lab}
              </button>
            );
          })}
        </nav> */}
        <div className="ml-auto flex items-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
