// Type definitions for the prompt interface components
import { type Library } from "@shared/schema";

export interface ModelParams {
    temperature: number;
    max_tokens: number;
    top_p: number;
}

export interface RawTypingResponse {
    name: string;
    content: string;
    code: string;
}

export interface RawConversationResponse {
    content: any;
}

export interface GeneratedInterface {
    name: string;
    code: string;
    isValid?: boolean;
    isEditing?: boolean;
}

export interface RawPrompt {
    prompt: string;
    model: string;
    params: ModelParams;
    type: string;
    selectedSchemas?: string[];
}

export interface PromptHistoryItem {
    prompt: string;
    timestamp: string;
}

export interface StoredPrompt {
    id: number;
    name: string;
    content: string;
    modelId: number;
    modelName: string;
    libraryId?: number;
    libraryName?: string;
    modelParams: string;
    selectedSchemas: Array<{ id: number; name: string }>;
    rawOutgoingPrompt: string;
    rawIncomingResponse: string;
    type: "typing" | "conversation";
    schemaId?: number;
}

export interface AIConfig {
    id: number;
    name: string;
}

export interface ValidationReport {
    valid: boolean;
    errors: Array<{
        path: string;
        message: string;
    }>;
}

export interface TreeNode {
    id: string;
    name: string;
    type: "folder" | "file";
    children?: TreeNode[];
    content?: any;
}
