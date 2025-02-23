import { useRef, useState } from "react";

import Editor from "@monaco-editor/react";
import React from "react";
import { Button } from "./ui/button";
import { DownloadIcon, Maximize2 } from "lucide-react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
} from "@radix-ui/react-dialog";
import { title } from "process";
import { DialogHeader } from "./ui/dialog";

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: "typescript" | "json";
    height?: string;
}

export function CodeEditor({
    value,
    onChange,
    language,
    height = "300px",
}: CodeEditorProps) {
    const editorRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const handleDownload = () => {
        if (editorRef.current) {
            const code = (editorRef.current as any).getValue();
            const blob = new Blob([code], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "code" + (language == "typescript" ? ".ts" : ".json");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
            }}
        >
            <div style={{ display: "flex", gap: "10px" }}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    style={{ width: "100px" }} // Set small button width
                >
                    <DownloadIcon size={16} />
                </Button>
                <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            style={{ width: "100px" }}
                        >
                            <Maximize2 className="h-4 w-4 mr-2" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 min-h-[calc(90vh-8rem)]">
                            <Editor
                                height={height}
                                defaultLanguage={language}
                                value={value}
                                onChange={(value) => onChange(value || "")}
                                onMount={handleEditorDidMount}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    roundedSelection: false,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    formatOnPaste: true,
                                    formatOnType: true,
                                    wordWrap: "on", // Enable word wrap
                                }}
                                theme="vs-light"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <Editor
                height={height}
                defaultLanguage={language}
                value={value}
                onChange={(value) => onChange(value || "")}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                    wordWrap: "on", // Enable word wrap
                }}
                theme="vs-light"
            />
        </div>
    );
}
