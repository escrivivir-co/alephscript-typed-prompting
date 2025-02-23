import { useState } from "react";
import { Button } from "@/components/ui/button";

import { CodeEditor } from "@/components/code-editor";

interface ResponseViewerProps {
    title: string;
    value: string;
    language?: "json" | "typescript";
}

export function ResponseViewer({
    title,
    value,
    language = "json",
}: ResponseViewerProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <div className="space-y-4 p-4">
            <div className="h-[400px] border rounded-md overflow-hidden">
                <CodeEditor
                    height="100%"
                    language={language}
                    value={value}
                    onChange={(newValue) => console.log(newValue)}
                />
            </div>

        </div>
    );
}


/*

            <!--<Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Full Screen
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-[calc(90vh-8rem)]">
					<CodeEditor
                            value={value}
                            onChange={() => {}}
                            language={language}
                            height="calc(90vh - 80px)"
                        />
                    </div>
                </DialogContent>
            </Dialog>-->
			*/