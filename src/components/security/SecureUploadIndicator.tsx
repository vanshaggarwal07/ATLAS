import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecureUploadIndicatorProps {
  isUploading?: boolean;
  isComplete?: boolean;
  fileName?: string;
  className?: string;
}

export function SecureUploadIndicator({
  isUploading = false,
  isComplete = false,
  fileName,
  className,
}: SecureUploadIndicatorProps) {
  return (
    <AnimatePresence mode="wait">
      {isUploading && (
        <motion.div
          key="uploading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            "bg-amber-500/10 border border-amber-500/20",
            className
          )}
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 flex items-center justify-center"
            >
              <Lock size={14} className="text-amber-600 dark:text-amber-400" />
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Encrypting & Uploading...
            </p>
            {fileName && (
              <p className="text-xs text-muted-foreground truncate">{fileName}</p>
            )}
          </div>
        </motion.div>
      )}

      {isComplete && !isUploading && (
        <motion.div
          key="complete"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg",
            "bg-emerald-500/10 border border-emerald-500/20",
            className
          )}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Securely Uploaded
            </p>
            {fileName && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Shield size={10} /> {fileName}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
