import { Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  isStreaming: boolean;
  isLoading: boolean;
  onGenerate: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function GenerateButton({
  isStreaming,
  isLoading,
  onGenerate,
  onStop,
  disabled
}: GenerateButtonProps) {
  return (
    <Button
      onClick={isStreaming ? onStop : onGenerate}
      disabled={disabled || isLoading}
      className="w-full flex items-center justify-center gap-2"
    >
      {isStreaming ? (
        <>
          <Square className="h-4 w-4" />
          Stop Generation
        </>
      ) : (
        isLoading ? "Generating..." : "Generate Interfaces"
      )}
    </Button>
  );
}


export function ChatButton({
	isStreaming,
	isLoading,
	onGenerate,
	onStop,
	disabled
  }: GenerateButtonProps) {
	return (
	  <Button
		onClick={isStreaming ? onStop : onGenerate}
		disabled={disabled || isLoading}
		className="w-full flex items-center justify-center gap-2"
	  >
		{isStreaming ? (
		  <>
			<Square className="h-4 w-4" />
			Stop Generation
		  </>
		) : (
		  isLoading ? "Generating..." : "Generate Message"
		)}
	  </Button>
	);
  }