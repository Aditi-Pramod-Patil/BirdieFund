import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-50 max-w-md bg-white border border-slate-200 text-slate-900 px-4 py-3 rounded-xl shadow-sm flex items-center gap-3"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-medium text-slate-800 leading-snug">{toastMessage}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
