import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { History, Clock, Download } from "lucide-react";
import { type PromptHistoryItem } from "./types";

interface PromptInputProps {
  prompt: string;
  promptHistory: PromptHistoryItem[];
  onPromptChange: (prompt: string) => void;
  onHistorySelect: (prompt: string) => void;
  onSave: () => void;
  disabled?: boolean;
}

export function PromptInput({
  prompt,
  promptHistory,
  onPromptChange,
  onHistorySelect,
  onSave,
  disabled
}: PromptInputProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Write Your Prompt</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onSave}
              disabled={disabled}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                  <History className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Prompt History</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 py-2">
                  {promptHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {promptHistory.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                          onClick={() => onHistorySelect(item.prompt)}
                        >
                          <div className="flex-1">
                            <p className="text-sm line-clamp-2">{item.prompt}</p>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Describe your data structure in natural language..."
          className="min-h-[200px]"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
