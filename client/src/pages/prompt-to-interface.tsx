import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { type Library } from "@shared/schema";

import {
    type ModelParams,
    type RawTypingResponse,
    type GeneratedInterface,
    type RawPrompt,
    type PromptHistoryItem,
    type StoredPrompt,
} from "@/components/prompt-interface/types";

import { ModelSelector } from "@/components/prompt-interface/ModelSelector";
import { LibrarySelector } from "@/components/prompt-interface/LibrarySelector";
import { PromptInput } from "@/components/prompt-interface/PromptInput";
import { InterfaceTable } from "@/components/prompt-interface/InterfaceTable";
import { StoredPrompts } from "@/components/prompt-interface/StoredPrompts";
import { AccordionLayout } from "@/components/prompt-interface/AccordionLayout";
import { GenerateButton } from "@/components/prompt-interface/GenerateButton";
import { QueryWrapper } from "@/components/prompt-interface/QueryWrapper";
import { ResponseViewer } from "@/components/prompt-interface/ResponseViewer";
import { LucideSave } from "lucide-react";

export default function PromptToInterface() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    // Basic state
    const [prompt, setPrompt] = useState(
        "Write interfaces to represent a shop order for a product"
    );
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedLibrary, setSelectedLibrary] = useState<string>("");
    const [selectedSchemas, setSelectedSchemas] = useState<number[]>([]);
    const [editingPromptId, setEditingPromptId] = useState<number | null>(null);

    // Generation state
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamId, setStreamId] = useState<string | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Interface state
    const [generatedInterfaces, setGeneratedInterfaces] = useState<
        GeneratedInterface[]
    >([]);
    const [rawIncomingResponse, setRawIncomingResponse] = useState<
        RawTypingResponse[]
    >([]);
    const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);

    // Model parameters
    const [modelParams, setModelParams] = useState<ModelParams>({
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
    });

    const handleParamChange = (param: keyof ModelParams, value: string) => {
        setModelParams((prev) => ({
            ...prev,
            [param]: parseFloat(value),
        }));
    };

    // Queries
    const { data: aiConfigs, isLoading: isLoadingConfigs } = useQuery<any[]>({
        queryKey: ["/api/ai-configs"],
        retry: false,
    });

    const { data: libraries } = useQuery<Library[]>({
        queryKey: ["/api/libraries"],
    });

    const { data: schemas } = useQuery<any[]>({
        queryKey: [`/api/libraries/${selectedLibrary}/schemas`],
        enabled: !!selectedLibrary,
    });

    const { data: storedPrompts, refetch: refetchPrompts } = useQuery({
        queryKey: ["/api/stored-prompts"],
    });

    // Mutations
    const savePromptMutation = useMutation({
        mutationFn: async (data: {
            name?: string;
            content: string;
            modelId: number;
            modelName: string;
            schemaId: number;
            modelParams: string;
            type: "typing" | "conversation";
            libraryId: number | null;
            libraryName: string | null;
            selectedSchemas: Array<{ id: number; name: string }>;
            rawOutgoingPrompt: string;
            rawIncomingResponse: string;
        }) => {
            const res = await apiRequest("POST", "/api/stored-prompts", data);
            return res.json();
        },
        onSuccess: () => {
            refetchPrompts();
            toast({
                title: "Success",
                description: "Prompt saved successfully",
            });
        },
    });

    const updatePromptMutation = useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: Partial<StoredPrompt>;
        }) => {
            const res = await apiRequest(
                "PATCH",
                `/api/stored-prompts/${id}`,
                data
            );
            return res.json();
        },
        onSuccess: () => {
            refetchPrompts();
            setEditingPromptId(null);
            toast({
                title: "Success",
                description: "Prompt updated successfully",
            });
        },
    });

    const deletePromptMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/stored-prompts/${id}`);
        },
        onSuccess: () => {
            refetchPrompts();
            if (editingPromptId) {
                setEditingPromptId(null);
            }
            toast({
                title: "Success",
                description: "Prompt deleted successfully",
            });
        },
    });

    // Handlers
    const handleSavePrompt = async () => {
        if (!prompt || !selectedModel) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        const promptName = !editingPromptId
            ? window.prompt("Enter a name for this prompt:")
            : undefined;
        if (!editingPromptId && !promptName) return;

        const selectedModelConfig = aiConfigs?.find(
            (config: any) => config.id.toString() === selectedModel
        );
        const selectedLibraryDetails = libraries?.find(
            (lib) => lib.id.toString() === selectedLibrary
        );
        const selectedSchemasDetails = selectedSchemas
            .map((id) => schemas?.find((s: any) => s.id === id))
            .filter(Boolean)
            .map((schema: any) => ({
                id: schema.id,
                name: schema.name,
            }));

        const outgoingPrompt = {
            prompt,
            selectedLibraryInterfaces: selectedSchemas
                .map((id) => schemas?.find((s: any) => s.id === id))
                .filter(Boolean)
                .map((schema: any) => schema?.typeScript || "")
                .join("\n\n"),
            model: selectedModel,
            params: modelParams,
            type: "typing",
        };

        const promptData: any = {
            name: promptName || undefined,
            content: prompt,
            modelId: parseInt(selectedModel),
            modelName: selectedModelConfig?.name || "",
            schemaId: 1,
            modelParams: JSON.stringify(modelParams),
            type: "typing" as const,
            libraryId: selectedLibraryDetails?.id || 0,
            libraryName: selectedLibraryDetails?.name || "",
            selectedSchemas: selectedSchemasDetails,
            rawOutgoingPrompt: JSON.stringify(outgoingPrompt, null, 2),
            rawIncomingResponse: JSON.stringify(rawIncomingResponse, null, 2),
        };

        if (editingPromptId) {
            await updatePromptMutation.mutateAsync({
                id: editingPromptId,
                data: promptData,
            });
        } else {
            await savePromptMutation.mutateAsync(promptData);
        }
    };

    const stopGeneration = async () => {
        if (streamId) {
            try {
                await fetch("/api/stop-generation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ streamId }),
                });
            } catch (error) {
                console.error("Failed to stop generation:", error);
            } finally {
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }
                setIsStreaming(false);
                setStreamId(null);
            }
        }
    };

    const handleGenerate = async () => {
        if (!selectedModel) {
            toast({
                title: "Error",
                description: "Please select a model",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setIsStreaming(true);
        setRawIncomingResponse([]);

        const outgoingPrompt: RawPrompt = {
            prompt,
            model: selectedModel,
            params: modelParams,
            type: "typing",
            selectedSchemas: selectedSchemas
                .map((id) => schemas?.find((s) => s.id === id))
                .filter(Boolean)
                .map((schema) => schema?.typeScript || ""),
        };

        try {
            const result = await fetch("/api/generate/interface", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(outgoingPrompt),
            });

            if (!result.ok) {
                throw new Error(`HTTP error! status: ${result.status}`);
            }

            const reader = result.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                throw new Error("Failed to get response reader");
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.trim().startsWith("data:")) {
                        try {
                            const data = JSON.parse(line.trim().substring(5));

                            if (data.streamId) {
                                setStreamId(data.streamId);
                            } else if (data.typescript) {
                                setRawIncomingResponse(
                                    Array.isArray(data.typescript)
                                        ? data.typescript
                                        : data.typescript
                                );
                            }
                        } catch (e) {
                            console.error("Error parsing SSE data:", e);
                            toast({
                                title: "Error",
                                description: "Failed to parse server response",
                                variant: "destructive",
                            });
                        }
                    }
                }
            }

            const newHistory = [
                { prompt, timestamp: new Date().toISOString() },
                ...promptHistory,
            ].slice(0, 10);
            setPromptHistory(newHistory);
            localStorage.setItem("promptHistory", JSON.stringify(newHistory));
        } catch (error) {
            console.error("Failed to generate interfaces:", error);
            toast({
                title: "Error",
                description: "Failed to generate interfaces",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setStreamId(null);
        }
    };

    const handleSaveAsSchema = () => {
        if (!generatedInterfaces.length) {
            toast({
                title: "Error",
                description: "No interfaces to save",
                variant: "destructive",
            });
            return;
        }

        const params = new URLSearchParams();
        params.append(
            "typescript",
            generatedInterfaces.map((i) => i.code).join("\n\n")
        );
        if (selectedLibrary) {
            params.append("libraryId", selectedLibrary);
        }
        setLocation(`/schema-creator?${params.toString()}`);
    };

    // Side effects
    useEffect(() => {
        const savedHistory = localStorage.getItem("promptHistory");
        if (savedHistory) {
            setPromptHistory(JSON.parse(savedHistory));
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (
            !isLoadingConfigs &&
            Array.isArray(aiConfigs) &&
            aiConfigs.length > 0 &&
            !selectedModel
        ) {
            const dummyModel = aiConfigs.find(
                (config: any) => config.name === "OpenAI GPT-4"
            );
            if (dummyModel) {
                setSelectedModel(dummyModel.id.toString());
            }
        }
    }, [aiConfigs, isLoadingConfigs, selectedModel]);

    useEffect(() => {
        if (libraries && (libraries?.length ?? 0) > 0 && !selectedLibrary) {
            setSelectedLibrary(libraries[0].id.toString());
        }
    }, [libraries]);

    useEffect(() => {
        if (schemas && (schemas?.length ?? 0) > 0) {
            const allSchemaIds = schemas.map((schema: any) => schema.id);
            setSelectedSchemas(allSchemaIds);
        }
    }, [schemas]);

    useEffect(() => {
        if (rawIncomingResponse.length > 0) {
            try {
                const parsedInterfaces = rawIncomingResponse.map(
                    (response) => ({
                        name: response.name || "Interface",
                        code: response.code,
                        isValid: true,
                        isEditing: false,
                    })
                );
                setGeneratedInterfaces(parsedInterfaces);
            } catch (error) {
                console.error("Failed to parse interfaces:", error);
                toast({
                    title: "Error",
                    description: "Failed to parse the generated interfaces",
                    variant: "destructive",
                });
                setGeneratedInterfaces([]);
            }
        }
    }, [rawIncomingResponse]);

    // Layout sections
    const sections = [
        {
            id: "typing-prompts",
            title: "Stored Prompts",
            content: (
                <StoredPrompts
                    storedPrompts={storedPrompts as StoredPrompt[]}
                    editingPromptId={editingPromptId}
                    onEdit={(stored) => {
                        setEditingPromptId(stored.id);
                        setPrompt(stored.content);
                        setSelectedModel(stored.modelId.toString());
                        if (stored.modelParams) {
                            setModelParams(JSON.parse(stored.modelParams));
                        }
                        if (stored.libraryId) {
                            setSelectedLibrary(stored.libraryId.toString());
                        }
                        if (stored.selectedSchemas) {
                            setSelectedSchemas(
                                stored.selectedSchemas.map(
                                    (schema) => schema.id
                                )
                            );
                        }
                    }}
                    onDelete={(id) => deletePromptMutation.mutate(id)}
                    onSave={handleSavePrompt}
                />
            ),
        },
        {
            id: "main-content",
            title: "Main Content",
            content: (
                <div className="grid md:grid-cols-2 gap-6">
                    <PromptInput
                        prompt={prompt}
                        promptHistory={promptHistory}
                        onPromptChange={setPrompt}
                        onHistorySelect={setPrompt}
                        onSave={handleSavePrompt}
                        disabled={!prompt || !selectedModel}
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
                                        onModelSelect={setSelectedModel}
                                        onParamChange={handleParamChange}
                                    />
                                </QueryWrapper>

                                <LibrarySelector
                                    selectedLibrary={selectedLibrary}
                                    libraries={libraries}
                                    schemas={schemas}
                                    selectedSchemas={selectedSchemas}
                                    onLibrarySelect={setSelectedLibrary}
                                    onSchemaSelect={(schemaId) => {
                                        setSelectedSchemas((prev) => {
                                            const isSelected =
                                                prev.includes(schemaId);
                                            return isSelected
                                                ? prev.filter(
                                                      (id) => id !== schemaId
                                                  )
                                                : [...prev, schemaId];
                                        });
                                    }}
                                />

                                <GenerateButton
                                    isStreaming={isStreaming}
                                    isLoading={isLoading}
                                    onGenerate={handleGenerate}
                                    onStop={stopGeneration}
                                    disabled={!prompt || !selectedModel}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ),
        },
        {
            id: "outgoing-prompt",
            title: "Raw Outgoing Prompt",
            content: (
                <ResponseViewer
                    title="Raw Outgoing Prompt"
                    value={JSON.stringify(
                        {
                            prompt,
                            selectedLibraryInterfaces: selectedSchemas
                                .map((id) => schemas?.find((s) => s.id === id))
                                .filter(Boolean)
                                .map((schema) => schema?.typeScript || "")
                                .join("\n\n"),
                            model: selectedModel,
                            params: modelParams,
                            type: "typing",
                        },
                        null,
                        2
                    )}
                />
            ),
        },
        {
            id: "incoming-response",
            title: "Raw Incoming Response",
            content: (
                <ResponseViewer
                    title="Raw Incoming Response"
                    value={JSON.stringify(rawIncomingResponse, null, 2)}
                />
            ),
        },
        {
            id: "generated-interfaces",
            title: "Types",
            content: (
                <div className="space-y-4 p-4">
                    <div className="flex justify-between items-center">
                        <Button
                            onClick={handleSaveAsSchema}
                            disabled={!generatedInterfaces.length}
                            variant="outline"
                        >
                            <LucideSave className="mr-2 h-4 w-4" />
                            Save as Schema
                        </Button>
                    </div>
                    <InterfaceTable
                        interfaces={generatedInterfaces}
                        onEdit={(id) => {
                            setGeneratedInterfaces((prev) =>
                                prev.map((int) =>
                                    int.name === id
                                        ? { ...int, isEditing: true }
                                        : int
                                )
                            );
                        }}
                        onSave={(id, newContent) => {
                            setGeneratedInterfaces((prev) =>
                                prev.map((int) =>
                                    int.name === id
                                        ? {
                                              ...int,
                                              code: newContent,
                                              isEditing: false,
                                          }
                                        : int
                                )
                            );
                        }}
                        onDelete={(id) => {
                            setGeneratedInterfaces((prev) =>
                                prev.filter((int) => int.name !== id)
                            );
                        }}
                        onAdd={() => {
                            setGeneratedInterfaces((prev) => [
                                ...prev,
                                {
                                    name: `Interface${prev.length + 1}`,
                                    code: "interface NewInterface {\n  // Add properties here\n}",
                                    isEditing: true,
                                },
                            ]);
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Prompt to Interface</h1>
                </div>

                <AccordionLayout
                    sections={sections}
                    defaultValues={[
                        "typing-prompts",
                        "main-content",
                        "outgoing-prompt",
                        "incoming-response",
                        "generated-interfaces",
                    ]}
                />
            </div>
        </div>
    );
}
