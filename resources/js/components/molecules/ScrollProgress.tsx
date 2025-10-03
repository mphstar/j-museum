import React,{useEffect,useState} from 'react';
export function ScrollProgress({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }){
  const [progress,setProgress]=useState(0);
  useEffect(()=>{const el=targetRef.current; if(!el) return; const onScroll=()=>{const max=el.scrollHeight-el.clientHeight; setProgress(max>0?el.scrollTop/max:0);}; el.addEventListener('scroll',onScroll,{passive:true}); onScroll(); return ()=>el.removeEventListener('scroll',onScroll);},[targetRef]);
  return (<div className="fixed left-0 top-0 right-0 h-1 bg-white/10 z-50"><div className="h-full bg-white" style={{width:`${progress*100}%`}} /></div>);
}
