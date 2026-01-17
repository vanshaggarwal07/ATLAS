import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X, Loader2, FileCheck, Shield, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFileParser, ParsedData } from '@/hooks/useFileParser';
import { motion, AnimatePresence } from 'framer-motion';
import { DataSecurityBadge } from '@/components/security/DataSecurityBadge';

interface FileUploadZoneProps {
  onFilesParsed: (data: ParsedData) => void;
  className?: string;
}

export function FileUploadZone({ onFilesParsed, className }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; data: ParsedData } | null>(null);
  const { parseFile, parsing } = useFileParser();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const parsed = await parseFile(files[0]);
      if (parsed) {
        setUploadedFile({ name: files[0].name, data: parsed });
        onFilesParsed(parsed);
      }
    }
  }, [parseFile, onFilesParsed]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const parsed = await parseFile(files[0]);
      if (parsed) {
        setUploadedFile({ name: files[0].name, data: parsed });
        onFilesParsed(parsed);
      }
    }
    e.target.value = '';
  }, [parseFile, onFilesParsed]);

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 bg-secondary/10",
          parsing && "pointer-events-none opacity-70"
        )}
      >
        <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
            disabled={parsing}
          />
          
          <AnimatePresence mode="wait">
            {parsing ? (
              <motion.div
                key="parsing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-500 flex items-center justify-center"
                  >
                    <Lock size={18} className="text-amber-600 dark:text-amber-400" />
                  </motion.div>
                </div>
                <p className="text-sm font-medium mt-3">Encrypting & Parsing...</p>
                <p className="text-xs text-muted-foreground mt-1">Your data is being secured</p>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all",
                  isDragging ? "bg-primary/20" : "bg-secondary"
                )}>
                  <Upload className={cn(
                    "w-7 h-7 transition-colors",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <p className="text-sm font-medium">
                  {isDragging ? "Drop your file here" : "Upload CSV or Excel file"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag and drop or click to browse
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-1 rounded bg-secondary text-xs font-medium">.csv</span>
                  <span className="px-2 py-1 rounded bg-secondary text-xs font-medium">.xlsx</span>
                  <span className="px-2 py-1 rounded bg-secondary text-xs font-medium">.xls</span>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Shield size={12} />
                  <span className="text-[10px] font-medium">Your data is encrypted & protected</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </label>
      </div>

      {/* Uploaded File Preview */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center relative">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <Lock size={8} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {uploadedFile.name}
                    <DataSecurityBadge variant="minimal" />
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedFile.data.rowCount} rows • {uploadedFile.data.headers.length} columns • Encrypted
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Column Preview */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {uploadedFile.data.headers.slice(0, 8).map((header) => (
                <span
                  key={header}
                  className="px-2 py-0.5 rounded-md bg-secondary text-xs font-medium"
                >
                  {header}
                </span>
              ))}
              {uploadedFile.data.headers.length > 8 && (
                <span className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground">
                  +{uploadedFile.data.headers.length - 8} more
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
