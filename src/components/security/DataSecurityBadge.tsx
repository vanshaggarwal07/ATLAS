import { Shield, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DataSecurityBadgeProps {
  variant?: 'inline' | 'card' | 'minimal';
  showDetails?: boolean;
  className?: string;
}

export function DataSecurityBadge({ 
  variant = 'inline', 
  showDetails = false,
  className 
}: DataSecurityBadgeProps) {
  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400",
              className
            )}>
              <ShieldCheck size={14} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Your data is encrypted and protected</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm flex items-center gap-2">
              Enterprise-Grade Protection
              <Lock size={12} className="text-emerald-600 dark:text-emerald-400" />
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Your business data is encrypted at rest and in transit. Only you can access your information.
            </p>
            {showDetails && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium">
                  <Lock size={10} /> AES-256 Encryption
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium">
                  <EyeOff size={10} /> Zero Admin Access
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium">
                  <ShieldCheck size={10} /> SOC 2 Compliant
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: inline variant
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      "text-xs font-medium",
      className
    )}>
      <ShieldCheck size={12} />
      <span>Protected & Encrypted</span>
    </div>
  );
}
