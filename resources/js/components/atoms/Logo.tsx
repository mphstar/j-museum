import { motion } from 'framer-motion';
export function Logo(){
  return (
    <motion.div
      initial={{ rotate: 0 }}
      whileHover={{ rotate: 10, scale: 1.05 }}
      className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30"
      aria-label="Logo"
    >
      <span className="select-none">🌐</span>
    </motion.div>
  );
}
