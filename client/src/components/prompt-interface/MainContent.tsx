import { Card, CardContent } from "@/components/ui/card";
import { ModelSelector } from "./ModelSelector";
import { PromptInput } from "./PromptInput";
import { QueryWrapper } from "./QueryWrapper";
import { GenerateButton } from "./GenerateButton";
import { type ModelParams, type PromptHistoryItem } from "./types";

interface MainContentProps {
  prompt: string;
  promptHistory: PromptHistoryItem[];
  selectedModel: string;
  modelParams: ModelParams;
  aiConfigs: any;
  isLoadingConfigs: boolean;
  isStreaming: boolean;
  isLoading: boolean;
  onPromptChange: (value: string) => void;
  onHistorySelect: (value: string) => void;
  onSave: () => void;
  onModelSelect: (value: string) => void;
  onParamChange: (param: keyof ModelParams, value: string) => void;
  onGenerate: () => void;
  onStop: () => void;
  disabled: boolean;
}

export function MainContent({
  prompt,
  promptHistory,
  selectedModel,
  modelParams,
  aiConfigs,
  isLoadingConfigs,
  isStreaming,
  isLoading,
  onPromptChange,
  onHistorySelect,
  onSave,
  onModelSelect,
  onParamChange,
  onGenerate,
  onStop,
  disabled
}: MainContentProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <PromptInput
        prompt={prompt}
        promptHistory={promptHistory}
        onPromptChange={onPromptChange}
        onHistorySelect={onHistorySelect}
        onSave={onSave}
        disabled={disabled}
      />
      <Card className="h-fit">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <QueryWrapper
              isLoading={isLoadingConfigs}
              isEmpty={!aiConfigs?.length}
              emptyMessage="No AI models configured."
              configureLink="/ai-config"
            >
              <ModelSelector
                selectedModel={selectedModel}
                modelParams={modelParams}
                aiConfigs={aiConfigs}
                isLoadingConfigs={isLoadingConfigs}
                onModelSelect={onModelSelect}
                onParamChange={onParamChange}
              />
            </QueryWrapper>

            <GenerateButton
              isStreaming={isStreaming}
              isLoading={isLoading}
              onGenerate={onGenerate}
              onStop={onStop}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
