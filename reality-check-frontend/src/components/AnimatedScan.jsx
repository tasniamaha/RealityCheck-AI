import { motion } from 'framer-motion';

export default function AnimatedScan() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 border-4 border-transparent border-t-cyan-400 border-r-purple-400 rounded-full mx-auto"
    />
  );
}