import { useState } from 'react';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EncryptedDataPreviewProps {
  data: string | number | null | undefined;
  type?: 'text' | 'number' | 'currency' | 'percentage';
  maskLength?: number;
  className?: string;
  allowReveal?: boolean;
}

export function EncryptedDataPreview({
  data,
  type = 'text',
  maskLength = 8,
  className,
  allowReveal = true,
}: EncryptedDataPreviewProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const formatData = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    
    switch (type) {
      case 'currency':
        return `₹${Number(value).toLocaleString('en-IN')}`;
      case 'percentage':
        return `${value}%`;
      case 'number':
        return Number(value).toLocaleString();
      default:
        return String(value);
    }
  };

  const generateMask = () => {
    const chars = '•●○◦◆◇■□▪▫';
    return Array.from({ length: maskLength }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  };

  const maskedValue = generateMask();
  const displayValue = isRevealed ? formatData(data) : maskedValue;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn(
        "font-mono text-sm transition-all duration-300",
        !isRevealed && "text-muted-foreground tracking-wider"
      )}>
        {displayValue}
      </span>
      {allowReveal && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsRevealed(!isRevealed)}
        >
          {isRevealed ? (
            <EyeOff size={12} className="text-muted-foreground" />
          ) : (
            <Eye size={12} className="text-muted-foreground" />
          )}
        </Button>
      )}
      {!isRevealed && (
        <Lock size={10} className="text-emerald-500" />
      )}
    </div>
  );
}

interface EncryptedTableCellProps {
  children: React.ReactNode;
  isEncrypted?: boolean;
}

export function EncryptedTableCell({ children, isEncrypted = true }: EncryptedTableCellProps) {
  const [isRevealed, setIsRevealed] = useState(!isEncrypted);

  if (!isEncrypted) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center gap-2">
      {isRevealed ? (
        children
      ) : (
        <span className="font-mono text-muted-foreground tracking-wider text-sm">
          ••••••••
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0"
        onClick={() => setIsRevealed(!isRevealed)}
      >
        {isRevealed ? (
          <EyeOff size={10} className="text-muted-foreground" />
        ) : (
          <Eye size={10} className="text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}
