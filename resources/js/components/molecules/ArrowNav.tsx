import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

export function ArrowNav({active,onJump,total}:{active:number;onJump:(i:number)=>void;total:number}){
  const disabledUp=active===0; const disabledDown=active===total-1;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      <button aria-label="Sebelumnya" disabled={disabledUp} onClick={()=>!disabledUp&&onJump(active-1)} className={`h-11 w-11 rounded-full border flex items-center justify-center text-white transition group backdrop-blur-sm bg-white/5 border-white/30 hover:bg-white/20 active:scale-95 ${disabledUp?'opacity-30 cursor-not-allowed':''}`}>
        <MdKeyboardArrowUp   />
      </button>
      <button aria-label="Berikutnya" disabled={disabledDown} onClick={()=>!disabledDown&&onJump(active+1)} className={`h-11 w-11 rounded-full border flex items-center justify-center text-white transition group backdrop-blur-sm bg-white/5 border-white/30 hover:bg-white/20 active:scale-95 ${disabledDown?'opacity-30 cursor-not-allowed':''}`}>
        <MdKeyboardArrowDown />
      </button>
    </div>
  );
}
