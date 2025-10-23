import { motion } from 'framer-motion';
export function Logo() {
    return (
        <div className='flex gap-2'> 
            <img className='h-8 w-8 aspect-square' src="/images/website/logo/polije.png" alt="Polije Logo" />
            <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 10, scale: 1.05 }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-cyan-500/30"
                aria-label="Logo"
            >
                <span className="select-none">🌐</span>
            </motion.div>
        </div>
    );
}
