import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFileParser } from '@/hooks/useFileParser';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  File,
  X,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { DataSecurityBadge } from '@/components/security/DataSecurityBadge';
import { SecurityInfoPanel } from '@/components/security/SecurityInfoPanel';

interface AuditFileUploadProps {
  sessionId: string;
  onNext: () => void;
}

const FILE_CATEGORIES = [
  { id: 'trial_balance', name: 'Trial Balance', required: true, description: 'Opening and closing trial balance' },
  { id: 'general_ledger', name: 'General Ledger', required: true, description: 'Complete GL with all transactions' },
  { id: 'pnl', name: 'Profit & Loss', required: true, description: 'Income statement for the period' },
  { id: 'balance_sheet', name: 'Balance Sheet', required: true, description: 'Statement of financial position' },
  { id: 'bank_statements', name: 'Bank Statements', required: false, description: 'Bank account statements' },
  { id: 'invoices_sales', name: 'Sales Invoices', required: false, description: 'Sales and revenue invoices' },
  { id: 'invoices_purchase', name: 'Purchase Invoices', required: false, description: 'Vendor and expense invoices' },
  { id: 'expenses', name: 'Expense Records', required: false, description: 'Detailed expense breakdown' },
  { id: 'other', name: 'Other Documents', required: false, description: 'Additional supporting documents' },
];

interface UploadedFile {
  id: string;
  file_name: string;
  file_type: string;
  file_category: string;
  status: string;
  row_count: number | null;
  headers: string[] | null;
}

export function AuditFileUpload({ sessionId, onNext }: AuditFileUploadProps) {
  const queryClient = useQueryClient();
  const { parseFile, parsing } = useFileParser();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch uploaded files
  const { data: uploadedFiles, isLoading } = useQuery({
    queryKey: ['audit-files', sessionId],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('audit_files' as any)
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true }) as any);
      if (error) throw error;
      return data as UploadedFile[];
    },
  });

  // Upload file mutation
  const uploadFile = useMutation({
    mutationFn: async ({ file, category }: { file: File; category: string }) => {
      // Parse the file
      const parsed = await parseFile(file);
      if (!parsed) throw new Error('Failed to parse file');

      // Save to database
      const { error } = await (supabase
        .from('audit_files' as any)
        .insert({
          session_id: sessionId,
          file_name: file.name,
          file_type: file.name.split('.').pop() || 'unknown',
          file_category: category,
          file_size: file.size,
          raw_data: parsed.rows.slice(0, 100), // Store first 100 rows
          headers: parsed.headers,
          row_count: parsed.rowCount,
          status: 'processed',
        }) as any);

      if (error) throw error;
      return parsed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-files', sessionId] });
      setActiveCategory(null);
      toast.success('File uploaded and processed successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload file');
      console.error(error);
    },
  });

  // Delete file mutation
  const deleteFile = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await (supabase
        .from('audit_files' as any)
        .delete()
        .eq('id', fileId) as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-files', sessionId] });
      toast.success('File removed');
    },
  });

  const handleDrop = useCallback((e: React.DragEvent, category: string) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        uploadFile.mutate({ file, category });
      } else {
        toast.error('Please upload Excel (.xlsx, .xls) or CSV files');
      }
    }
  }, [uploadFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile.mutate({ file: files[0], category });
    }
    e.target.value = '';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      case 'csv':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCategoryFiles = (categoryId: string) => {
    return uploadedFiles?.filter(f => f.file_category === categoryId) || [];
  };

  const requiredFilesUploaded = FILE_CATEGORIES
    .filter(c => c.required)
    .every(c => getCategoryFiles(c.id).length > 0);

  const totalFilesUploaded = uploadedFiles?.length || 0;
  const progress = Math.min((totalFilesUploaded / 4) * 100, 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Financial Documents
              </CardTitle>
              <CardDescription className="mt-1">
                Upload your financial documents for AI analysis. Required files are marked with an asterisk (*).
              </CardDescription>
            </div>
            <DataSecurityBadge variant="inline" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Upload Progress</span>
              <span className="font-medium">{totalFilesUploaded} files uploaded</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* File Categories Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FILE_CATEGORIES.map((category) => {
              const files = getCategoryFiles(category.id);
              const hasFiles = files.length > 0;
              const isActive = activeCategory === category.id;

              return (
                <div
                  key={category.id}
                  className={`relative rounded-xl border-2 border-dashed p-4 transition-all ${
                    hasFiles
                      ? 'border-green-500/50 bg-green-500/5'
                      : isActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); setActiveCategory(category.id); }}
                  onDragLeave={() => { setIsDragging(false); setActiveCategory(null); }}
                  onDrop={(e) => handleDrop(e, category.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium flex items-center gap-1">
                        {category.name}
                        {category.required && <span className="text-destructive">*</span>}
                      </h4>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                    {hasFiles && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Uploaded Files */}
                  {files.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-background"
                        >
                          {getFileIcon(file.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.row_count} rows • {file.headers?.length} columns
                            </p>
                          </div>
                          <button
                            onClick={() => deleteFile.mutate(file.id)}
                            className="p-1 hover:bg-destructive/10 rounded"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={(e) => handleFileInput(e, category.id)}
                      disabled={parsing}
                    />
                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm">
                      {parsing && activeCategory === category.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {hasFiles ? 'Add More' : 'Upload File'}
                        </>
                      )}
                    </div>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Validation Notice */}
          {!requiredFilesUploaded && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-600 dark:text-yellow-400">
                  Required Files Missing
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please upload all required files (Trial Balance, General Ledger, P&L, Balance Sheet)
                  to proceed with the AI audit analysis.
                </p>
              </div>
            </div>
          )}

          {/* Security Info */}
          <SecurityInfoPanel />

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={onNext}
              disabled={!requiredFilesUploaded}
              className="gap-2"
            >
              Continue to Analysis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
