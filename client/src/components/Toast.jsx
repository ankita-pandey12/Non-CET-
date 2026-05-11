import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

export default function Toast({ show, message, onHide }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div className="toast-container">
      <AnimatePresence>
        {show && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <FiCheckCircle size={20} />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
