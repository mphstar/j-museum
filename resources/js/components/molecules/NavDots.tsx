export function NavDots({count,active,onJump}:{count:number;active:number;onJump:(i:number)=>void}){
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
      {Array.from({length:count}).map((_,i)=>(
        <button key={i} aria-label={`Go to section ${i+1}`} onClick={()=>onJump(i)} className={`h-3 w-3 rounded-full transition-all ${i===active?"scale-125 bg-white":"bg-white/40 hover:bg-white/70"}`} />
      ))}
    </div>
  );
}
