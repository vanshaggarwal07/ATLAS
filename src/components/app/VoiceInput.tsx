import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useVoiceToText } from '@/hooks/useVoiceToText';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  appendMode?: boolean; // If true, append to existing text
  existingText?: string;
  className?: string;
}

export function VoiceInput({ onTranscript, appendMode = false, existingText = '', className }: VoiceInputProps) {
  const { isRecording, isProcessing, toggleRecording } = useVoiceToText({
    onTranscript: (text) => {
      if (appendMode && existingText) {
        onTranscript(existingText + ' ' + text);
      } else {
        onTranscript(text);
      }
    },
  });

  const getTooltipText = () => {
    if (isProcessing) return 'Processing your speech...';
    if (isRecording) return 'Click to stop recording';
    return 'Click to speak (English/Hindi)';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleRecording}
            disabled={isProcessing}
            className={cn(
              "h-8 w-8 rounded-full transition-all duration-200",
              isRecording && "animate-pulse shadow-lg shadow-red-500/50",
              isProcessing && "opacity-70 cursor-wait",
              !isRecording && !isProcessing && "hover:bg-primary/10 hover:text-primary",
              className
            )}
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isRecording ? (
              <MicOff size={16} />
            ) : (
              <Mic size={16} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {getTooltipText()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
