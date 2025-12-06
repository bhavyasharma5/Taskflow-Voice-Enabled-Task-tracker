import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ConfirmDialog({ title, message, onConfirm, onCancel, isLoading }) {
  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="modal confirm-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="confirm-content">
            <AlertTriangle className="confirm-icon" />
            <h3 className="confirm-title">{title}</h3>
            <p className="confirm-message">{message}</p>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner"></span> : 'Delete'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ConfirmDialog;

