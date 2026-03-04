import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ isOpen, onClose, children, className = "" }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative bg-white/90 backdrop-blur-xl border border-[var(--glass-border)] shadow-[0_0_80px_rgba(255,154,108,0.3)] rounded-[20px] md:rounded-[32px] overflow-hidden max-h-[85vh] overflow-y-auto ${className}`}
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 flex items-center justify-center rounded-full bg-[rgba(255,154,108,0.15)] hover:bg-[rgba(255,154,108,0.25)] transition-colors z-10 group border-none cursor-pointer"
              >
                <X className="w-[18px] h-[18px] text-[var(--text-mid)] group-hover:rotate-90 transition-transform duration-300" />
              </button>
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
