import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTextToVoice } from '@/hooks/useTextToVoice';
import { cn } from '@/lib/utils';

interface TextToSpeechProps {
  text: string;
  className?: string;
}

export function TextToSpeech({ text, className }: TextToSpeechProps) {
  const { speak, stop, isSpeaking, isLoading } = useTextToVoice();

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClick}
            disabled={isLoading || !text}
            className={cn(
              "h-8 w-8 rounded-full transition-all",
              isSpeaking && "bg-primary/20 text-primary",
              className
            )}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isSpeaking ? (
              <VolumeX size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isLoading ? 'Generating speech...' : isSpeaking ? 'Click to stop' : 'Listen to this'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
