import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { type Schema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { AccordionLayout } from "@/components/prompt-interface/AccordionLayout";
import { ModelSelector } from "@/components/prompt-interface/ModelSelector";
import { PromptInput } from "@/components/prompt-interface/PromptInput";
import { ResponseViewer } from "@/components/prompt-interface/ResponseViewer";
import { ValidationReport as ValidationReportComponent } from "@/components/prompt-interface/ValidationReport";
import { QueryWrapper } from "@/components/prompt-interface/QueryWrapper";
import { ChatButton } from "@/components/prompt-interface/GenerateButton";
import { StoredPrompts } from "@/components/prompt-interface/StoredPrompts";
import { SchemaSelector } from "@/components/schema-selector";
import {
    type ModelParams,
    type StoredPrompt,
    type PromptHistoryItem,
    type ValidationReport as ValidationReportType,
    type RawConversationResponse,
} from "@/components/prompt-interface/types";

/**
 * {
  "content": "{\"content\":{\"id\":\"order123\",\"items\":[{\"product\":{\"id\":\"pizza-barbacoa\",\"name\":\"Barbacoa Pizza\",\"price\":12.99,\"quantityAvailable\":10},\"quantity\":1},{\"product\":{\"id\":\"hot-dog\",\"name\":\"Hot Dog\",\"price\":3.5,\"quantityAvailable\":20},\"quantity\":2},{\"product\":{\"id\":\"ice-cube\",\"name\":\"Ice Cube\",\"price\":0.5,\"quantityAvailable\":100},\"quantity\":1}],\"totalAmount\":20.49,\"status\":\"pending\",\"orderDate\":\"2023-10-10T12:00:00Z\",\"customerName\":\"Bob\",\"shippingAddress\":\"123 Main St, Anytown, USA\"}}"
}
 */
function PromptWithSchema() {
    // Basic state
    const [prompt, setPrompt] = useState("Order a pizza");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedSchema, setSelectedSchema] = useState<string>("");
    const [editingPromptId, setEditingPromptId] = useState<number | null>(null);
    const [response, setResponse] = useState("");
    const [validationReport, setValidationReport] =
        useState<ValidationReportType>({
            valid: false,
            errors: [],
        });
    const [isLoading, setIsLoading] = useState(false);
    const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
    const [modelParams, setModelParams] = useState<ModelParams>({
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
    });
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamId, setStreamId] = useState<string | null>(null);
    const [rawIncomingResponse, setRawIncomingResponse] =
        useState<RawConversationResponse>({ content: "" });
    const eventSourceRef = useRef<EventSource | null>(null);
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    // Queries
    const { data: aiConfigs, isLoading: isLoadingConfigs } = useQuery<any[]>({
        queryKey: ["/api/ai-configs"],
    });

    const { data: schemas = [] } = useQuery<Schema[]>({
        queryKey: ["/api/schemas"],
    });

    const { data: libraries } = useQuery<any[]>({
        queryKey: ["/api/libraries"],
    });

    const { data: storedPrompts = [], refetch: refetchPrompts } = useQuery<
        StoredPrompt[]
    >({
        queryKey: ["/api/stored-prompts"],
    });

    const { data: validationHistories, refetch: refetchValidationHistories } =
        useQuery({
            queryKey: ["/api/validation-histories", selectedSchema],
            enabled: !!selectedSchema,
        });

    useEffect(() => {
        const savedHistory = localStorage.getItem("promptWithSchemaHistory");
        if (savedHistory) {
            setPromptHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        const savedHistory = localStorage.getItem("validationHistory");
        if (savedHistory) {
            //setValidationHistory(JSON.parse(savedHistory));
        }
    }, []);

    const validateMutation = useMutation({
        mutationFn: async (jsonData: any) => {
            if (!selectedSchema) throw new Error("No schema selected");
            const res = await apiRequest(
                "POST",
                `/api/validate/${selectedSchema}`,
                jsonData
            );
            const data = await res.json();
            setValidationReport(data);
            return data;
        },
        onError: (error) => {
            toast({
                title: "Validation Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to validate response",
                variant: "destructive",
            });
        },
    });

    const savePromptMutation = useMutation({
        mutationFn: async (data: {
            name: string;
            content: string;
            modelId: number;
            schemaId: number;
            modelParams: string;
            type: string;
            modelName: string;
            libraryId: number | null;
            libraryName: string | null;
            selectedSchemas: { id: number; name: string }[];
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
        onError: (error) => {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to save prompt",
                variant: "destructive",
            });
        },
    });

    const deletePromptMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/stored-prompts/${id}`);
        },
        onSuccess: () => {
            refetchPrompts();
            toast({
                title: "Success",
                description: "Prompt deleted successfully",
            });
        },
    });

    // Add updatePromptMutation
    const updatePromptMutation = useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: Partial<StoredPrompt>;
        }) => {
            const res = await apiRequest(
                "PUT",
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

    const handleSavePrompt = async () => {
        if (!prompt || !selectedModel || !selectedSchema) {
            toast({
                title: "Error",
                description:
                    "Please select a model and schema, and provide a prompt",
                variant: "destructive",
            });
            return;
        }

        // Get selected schema details
        const selectedSchemaDetails = schemas?.find(
            (s) => s.id.toString() === selectedSchema
        );
        if (!selectedSchemaDetails) {
            toast({
                title: "Error",
                description: "Selected schema not found",
                variant: "destructive",
            });
            return;
        }

        // Get selected model details
        const selectedModelDetails = aiConfigs?.find(
            (config: any) => config.id.toString() === selectedModel
        );
        if (!selectedModelDetails) {
            toast({
                title: "Error",
                description: "Selected model not found",
                variant: "destructive",
            });
            return;
        }

        const promptData = {
            content: prompt,
            modelId: parseInt(selectedModel),
            modelName: selectedModelDetails.name,
            schemaId: parseInt(selectedSchema),
            modelParams: JSON.stringify(modelParams),
            type: "conversation" as const,
            libraryId: selectedSchemaDetails.libraryId || null,
            libraryName:
                libraries?.find((l) => l.id === selectedSchemaDetails.libraryId)
                    ?.name || null,
            selectedSchemas: [
                {
                    id: selectedSchemaDetails.id,
                    name: selectedSchemaDetails.name,
                },
            ],
            rawOutgoingPrompt: JSON.stringify(
                {
                    prompt,
                    selectedLibraryInterfaces: selectedSchemaDetails.typeScript,
                    model: selectedModel,
                    params: modelParams,
                    type: "conversation",
                },
                null,
                2
            ),
            rawIncomingResponse: rawIncomingResponse?.content,
        };

        try {
            if (editingPromptId) {
                await updatePromptMutation.mutateAsync({
                    id: editingPromptId,
                    data: promptData as any,
                });
            } else {
                const promptName = window.prompt(
                    "Enter a name for this prompt:"
                );
                if (!promptName) return;

                await savePromptMutation.mutateAsync({
                    ...promptData,
                    name: promptName,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to save prompt",
                variant: "destructive",
            });
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

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

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
        setResponse("");
        setValidationReport({ valid: false, errors: [] });
        setRawIncomingResponse({ content: "" });

        try {
            const result = await fetch("/api/generate/conversation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    model: selectedModel,
                    params: modelParams,
                    type: "conversation",
                    schemaId: selectedSchema,
                }),
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
                            } else if (data.response) {
                                setResponse(data.response?.content || data.response);
                                setRawIncomingResponse(
                                    Array.isArray(data.response)
                                        ? data.response.length > 0
                                            ? data.response[0]
                                            : {}
                                        : {
                                              content: data.response?.content || data.response
                                          }
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

            const newPromptHistory = [
                { prompt, timestamp: new Date().toISOString() },
                ...promptHistory,
            ].slice(0, 10);
            setPromptHistory(newPromptHistory);
            localStorage.setItem(
                "promptWithSchemaHistory",
                JSON.stringify(newPromptHistory)
            );
        } catch (error) {
            console.error("Failed to generate conversation response:", error);
            toast({
                title: "Error",
                description: "Failed to generate conversation response",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setStreamId(null);
        }
    };

    const handleValidate = async () => {
        if (!selectedSchema) {
            toast({
                title: "Error",
                description: "Please select a schema for validation",
                variant: "destructive",
            });
            return;
        }

        if (!response) {
            toast({
                title: "Error",
                description: "No response to validate",
                variant: "destructive",
            });
            return;
        }

        try {
            let jsonData  = JSON.parse(response);
            if (jsonData.content && typeof jsonData.content === "string") {
                jsonData.content = JSON.parse(jsonData.content);
            } else if (jsonData.content) {

            }
            const validationResult = await validateMutation.mutateAsync(
                jsonData
            );

            const historyEntry = {
                schemaId: parseInt(selectedSchema),
                prompt,
                response,
                validationReport: validationResult,
                isValid: validationResult.valid,
                timestamp: new Date().toISOString(),
            };

            await apiRequest("POST", "/api/validation-histories", historyEntry);
            await refetchValidationHistories();

            setValidationReport(validationResult);
        } catch (err) {
            toast({
                title: "Parsing Error",
                description: "Generated response is not valid JSON",
                variant: "destructive",
            });
        }
    };

    const handleSelectHistory = (historicPrompt: string) => {
        setPrompt(historicPrompt);
    };

    const handleCopy = () => {
        if (validationReport) {
            navigator.clipboard.writeText(
                JSON.stringify(validationReport, null, 2)
            );
            toast({
                title: "Copied",
                description: "Report copied to clipboard",
            });
        }
    };

    const handleParamChange = (param: keyof ModelParams, value: string) => {
        setModelParams((prev) => ({
            ...prev,
            [param]: parseFloat(value),
        }));
    };

    const handleDeletePrompt = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this prompt?")) {
            deletePromptMutation.mutate(id);
        }
    };

    useEffect(() => {
        if (
            !isLoadingConfigs &&
            (aiConfigs || [])?.length > 0 &&
            !selectedModel
        ) {
            const dummyModel = aiConfigs?.find(
                (config: any) => config.name === "Dummy Model"
            );
            if (dummyModel) {
                setSelectedModel(dummyModel.id.toString());
            }
        }
    }, [aiConfigs, isLoadingConfigs, selectedModel]);

    useEffect(() => {
        if (schemas?.length > 0 && !selectedSchema) {
            const productInterface = schemas.find(
                (schema: any) => schema.name === "Product Interface"
            );
            if (productInterface) {
                setSelectedSchema(productInterface.id.toString());
            }
        }
    }, [schemas]);

    const outgoingPromptValue = JSON.stringify(
        {
            prompt,
            schemaId: selectedSchema,
            interfaces:
                schemas?.find((s) => s.id.toString() === selectedSchema)
                    ?.typeScript || "",
            model: selectedModel,
            params: modelParams,
            type: "conversation",
        },
        null,
        2
    );

    const sections = [
        {
            id: "stored-prompts",
            title: "Conversation Prompts",
            content: (
                <StoredPrompts
                    storedPrompts={storedPrompts.filter(
                        (p) => p.type === "conversation"
                    )}
                    editingPromptId={editingPromptId}
                    onEdit={(stored) => {
                        setEditingPromptId(stored.id);
                        setPrompt(stored.content);
                        setSelectedModel(stored.modelId.toString());
                        setResponse(stored.rawIncomingResponse);
                        setRawIncomingResponse(
                            JSON.parse(stored.rawIncomingResponse)
                        );
                        if (stored.modelParams) {
                            setModelParams(JSON.parse(stored.modelParams));
                        }
                        if (stored.schemaId) {
                            setSelectedSchema(stored.schemaId.toString());
                        }
                    }}
                    onDelete={handleDeletePrompt}
                    onSave={handleSavePrompt}
                />
            ),
        },
        {
            id: "schema-selection",
            title: "Select Schema",
            content: (
                <SchemaSelector
                    schemas={schemas}
                    libraries={libraries}
                    selectedSchemaId={selectedSchema}
                    onSchemaSelect={setSelectedSchema}
                    showActions={false}
                    className="w-full"
                />
            ),
        },
        {
            id: "main-content",
            title: "Write Prompt & Generate",
            content: (
                <MainContent
                    prompt={prompt}
                    promptHistory={promptHistory}
                    selectedModel={selectedModel}
                    modelParams={modelParams}
                    aiConfigs={aiConfigs}
                    isLoadingConfigs={isLoadingConfigs}
                    isStreaming={isStreaming}
                    isLoading={isLoading}
                    onPromptChange={setPrompt}
                    onHistorySelect={setPrompt}
                    onSave={handleSavePrompt}
                    onModelSelect={setSelectedModel}
                    onParamChange={handleParamChange}
                    onGenerate={handleGenerate}
                    onStop={stopGeneration}
                    disabled={!prompt || !selectedModel || !selectedSchema}
                />
            ),
        },
        {
            id: "raw-data",
            title: "Raw Data",
            content: (
                <RawDataSection
                    outgoingPrompt={outgoingPromptValue}
                    incomingResponse={rawIncomingResponse}
                />
            ),
        },
        {
            id: "response",
            title: "Response & Validation",
            content: (
                <ResponseSection
                    response={response}
                    selectedSchema={selectedSchema}
                    validationReport={validationReport}
                    onValidate={handleValidate}
                    onCopy={handleCopy}
                />
            ),
        },
    ];

    return (
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">Conversation Prompts</h1>
            <AccordionLayout
                sections={sections}
                defaultValues={[
                    "stored-prompts",
                    "schema-selection",
                    "main-content",
                    "raw-data",
                    "response",
                ]}
            />
        </div>
    );
}

// Export the component as default
export default PromptWithSchema;

const MainContent = ({
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
    disabled,
}: any) => {
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

                <ChatButton
                    isStreaming={isStreaming}
                    isLoading={isLoading}
                    onGenerate={onGenerate}
                    onStop={onStop}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

const RawDataSection = ({ outgoingPrompt, incomingResponse }: any) => {
    return (
        <div>
            <ResponseViewer
                title="Raw Outgoing Prompt"
                value={outgoingPrompt}
            />
            <ResponseViewer
                title="Raw Incoming Response"
                value={JSON.stringify(incomingResponse, null, 2)}
            />
        </div>
    );
};

const ResponseSection = ({
    response,
    selectedSchema,
    validationReport,
    onValidate,
    onCopy,
}: any) => {
    const [, setLocation] = useLocation();
    return (
        <div className="space-y-4">
            <ResponseViewer
                title="Generated Response"
                value={response}
                language="json"
            />
            <Button
                onClick={onValidate}
                disabled={!response || !selectedSchema}
                className="w-full"
            >
                Validate Response
            </Button>
            <ValidationReportComponent
                report={validationReport}
                onCopy={onCopy}
                onAddToConversation={() => {
                    setLocation(
                        `/structured-conversations?schema=${selectedSchema}&response=${encodeURIComponent(
                            response
                        )}`
                    );
                }}
            />
        </div>
    );
};
