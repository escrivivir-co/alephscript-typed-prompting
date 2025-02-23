import { z } from "zod";
import {
    text,
    timestamp,
    integer,
    jsonb,
    boolean,
    pgTable,
} from "drizzle-orm/pg-core";

// Schema types
export interface Schema {
    id: number;
    name: string;
    typeScript: string;
    jsonSchema: string;
    category: string;
    labels: string[];
    description: string | null;
    createdAt: string;
    libraryId?: number | null;
}

export const insertSchemaSchema = z.object({
    name: z.string(),
    typeScript: z.string(),
    jsonSchema: z.string(),
    category: z.string().optional(),
    labels: z.array(z.string()).optional(),
    description: z.string().optional(),
    libraryId: z.number().nullable().optional(),
});

export type InsertSchema = z.infer<typeof insertSchemaSchema>;

// Validation History types
export interface ValidationHistory {
    id: number;
    schemaId: number;
    prompt: string;
    response: string;
    validationReport: ValidationReport;
    createdAt: string;
    isValid: boolean;
}

export const insertValidationHistorySchema = z.object({
    schemaId: z.number(),
    prompt: z.string(),
    response: z.string(),
    validationReport: z.object({
        valid: z.boolean(),
        errors: z.array(
            z.object({
                path: z.string(),
                message: z.string(),
            })
        ),
    }),
    isValid: z.boolean(),
});

export type InsertValidationHistory = z.infer<
    typeof insertValidationHistorySchema
>;

// Database schema
export const schemas = pgTable("schemas", {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    typeScript: text("typescript").notNull(),
    jsonSchema: text("json_schema").notNull(),
    category: text("category"),
    labels: text("labels").array(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    libraryId: integer("library_id").references(() => libraries.id),
});

export const validationHistories = pgTable("validation_histories", {
    id: integer("id").primaryKey(),
    schemaId: integer("schema_id")
        .references(() => schemas.id)
        .notNull(),
    prompt: text("prompt").notNull(),
    response: text("response").notNull(),
    validationReport: jsonb("validation_report").notNull(),
    isValid: boolean("is_valid").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

// Library types
export interface Library {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
}

export const insertLibrarySchema = z.object({
    name: z.string(),
    description: z.string().optional(),
});

export type InsertLibrary = z.infer<typeof insertLibrarySchema>;

// AI Configuration types
export const aiProviders = [
    "openai",
    "deepseek",
    "ollama",
    "anthropic",
] as const;
export type AIProvider = (typeof aiProviders)[number];

export interface AIConfig {
    id: number;
    name: string;
    provider: AIProvider;
    apiKey: string | null;
    baseUrl: string | null;
    models: string[];
    isActive: boolean;
    settings?: string;
    createdAt: string;
}

export const insertAIConfigSchema = z.object({
    name: z.string(),
    provider: z.enum(aiProviders),
    apiKey: z.string().nullable().optional(),
    baseUrl: z.string().nullable().optional(),
    models: z.array(z.string()).optional(),
    settings: z.string().transform((str) => {
        try {
            return JSON.parse(str);
        } catch {
            return {};
        }
    }),
});

export type InsertAIConfig = z.infer<typeof insertAIConfigSchema>;

// Validation Report Schema
export const validationReportSchema = z.object({
    valid: z.boolean(),
    errors: z.array(
        z.object({
            path: z.string(),
            message: z.string(),
        })
    ),
});

export type ValidationReport = z.infer<typeof validationReportSchema>;

// Stored Prompts types
export const promptTypes = ["typing", "conversation"] as const;
export type PromptType = (typeof promptTypes)[number];

// Update the StoredPrompt interface with new fields
export interface StoredPrompt {
    id: number;
    name: string;
    content: string;
    modelId: number;
    modelName: string; // Added to store model name
    schemaId: number;
    modelParams: string;
    createdAt: string;
    type: PromptType;
    libraryId: number | null; // Added for library reference
    libraryName: string | null; // Added to store library name
    selectedSchemas: Array<{ id: number; name: string }>; // Added for selected schemas
    rawOutgoingPrompt: string; // Added for raw outgoing prompt
    rawIncomingResponse: string; // Added for raw incoming response
}

// Update the insert schema with new fields
export const insertStoredPromptSchema = z.object({
    name: z.string(),
    content: z.string(),
    modelId: z.number(),
    modelName: z.string(), // Added validation for model name
    schemaId: z.number(),
    type: z.enum(promptTypes),
    modelParams: z.string().transform((str) => {
        try {
            return JSON.parse(str);
        } catch {
            return {};
        }
    }),
    libraryId: z.number().nullable(), // Added validation for library ID
    libraryName: z.string().nullable(), // Added validation for library name
    selectedSchemas: z.array(
        z.object({
            // Added validation for selected schemas
            id: z.number(),
            name: z.string(),
        })
    ),
    rawOutgoingPrompt: z.string(), // Added validation for raw outgoing prompt
    rawIncomingResponse: z.string(), // Added validation for raw incoming response
});

export type InsertStoredPrompt = z.infer<typeof insertStoredPromptSchema>;

// Mock data for common AI providers
export const mockAIConfigs: InsertAIConfig[] = [
    {
        name: "OpenAI GPT-4",
        provider: "openai",
        apiKey: "sk-svcacct-xxxxxx",
        baseUrl: "https://api.openai.com/v1",
        models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
        settings: JSON.stringify({
            defaultModel: "gpt-4",
            temperature: 0.7,
            max_tokens: 2000,
        }),
    },
    {
        name: "DeepSeek",
        provider: "deepseek",
        apiKey: "",
        baseUrl: "https://api.deepseek.com/v1",
        models: ["deepseek-chat", "deepseek-coder"],
        settings: JSON.stringify({
            defaultModel: "deepseek-chat",
            temperature: 0.7,
            max_tokens: 2000,
        }),
    },
    {
        name: "Ollama Local",
        provider: "ollama",
        apiKey: "",
        baseUrl: "http://localhost:11434",
        models: ["llama2", "codellama", "mistral"],
        settings: JSON.stringify({
            defaultModel: "llama2",
            temperature: 0.7,
            max_tokens: 2000,
        }),
    },
    {
        name: "Dummy Model",
        provider: "openai",
        apiKey: "dummy-key",
        baseUrl: "http://localhost:5000",
        models: ["dummy"],
        settings: JSON.stringify({
            defaultModel: "dummy",
            temperature: 0,
            max_tokens: 100,
        }),
    },
];

export const libraries = pgTable("libraries", {
    id: integer("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
});
