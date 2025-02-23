import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type AIConfig, type ModelParams } from "./types";

interface ModelSelectorProps {
  selectedModel: string;
  modelParams: ModelParams;
  aiConfigs?: AIConfig[];
  isLoadingConfigs: boolean;
  onModelSelect: (model: string) => void;
  onParamChange: (param: keyof ModelParams, value: string) => void;
}

export function ModelSelector({
  selectedModel,
  modelParams,
  aiConfigs,
  isLoadingConfigs,
  onModelSelect,
  onParamChange
}: ModelSelectorProps) {
  const [isParamsOpen, setIsParamsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Model</label>
        {isLoadingConfigs ? (
          <p className="text-sm text-muted-foreground">Loading models...</p>
        ) : aiConfigs?.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-yellow-600">No AI models configured.</p>
            <Link href="/ai-config">
              <Button variant="outline" size="sm">Configure AI Models</Button>
            </Link>
          </div>
        ) : (
          <Select value={selectedModel} onValueChange={onModelSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {aiConfigs?.map((config) => (
                <SelectItem key={config.id} value={config.id.toString()}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Collapsible
        open={isParamsOpen}
        onOpenChange={setIsParamsOpen}
        className="space-y-2"
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="flex w-full justify-between">
            <span>Model Parameters</span>
            <Settings2 className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature ({modelParams.temperature})</Label>
            <Input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={modelParams.temperature}
              onChange={(e) => onParamChange('temperature', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_tokens">Max Tokens ({modelParams.max_tokens})</Label>
            <Input
              id="max_tokens"
              type="range"
              min="100"
              max="4000"
              step="100"
              value={modelParams.max_tokens}
              onChange={(e) => onParamChange('max_tokens', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="top_p">Top P ({modelParams.top_p})</Label>
            <Input
              id="top_p"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={modelParams.top_p}
              onChange={(e) => onParamChange('top_p', e.target.value)}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}