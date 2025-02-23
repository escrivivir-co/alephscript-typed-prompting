import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { setupSwagger } from "./swagger";
import { mockAIConfigs } from "@shared/schema";
import { OpenAI } from "openai";

// Import route modules
import schemaRoutes from "./routes/schema.routes";
import libraryRoutes from "./routes/library.routes";
import aiConfigRoutes from "./routes/ai-config.routes";
import validationRoutes from "./routes/validation.routes";
import interfaceGenerationRoutes from "./routes/interface-generation.routes";
import storedPromptsRoutes from "./routes/stored-prompts.routes";
import clientPackageRoutes from "./routes/client-package.routes";

// Add new initialization function
async function initializeAIConfigs(storage: any) {
    try {
        const existingConfigs = await storage.getAIConfigs();
        if (existingConfigs.length === 0) {
            await Promise.all(
                mockAIConfigs.map((config) => storage.createAIConfig(config))
            );
            console.log("AI configurations initialized successfully");
        }
    } catch (err) {
        console.error("Failed to initialize AI configurations:", err);
    }
}

// Update model handlers to support conversation responses
interface ModelHandler {
    generateCompletion: (prompt: string, params: any) => Promise<string>;
    generateConversation: (prompt: string, params: any) => Promise<string>;
}

// OpenAI handler implementation
const openAIHandler: ModelHandler = {
    generateCompletion: async (prompt: string, params: any) => {
        // TODO: Implement OpenAI API call
        throw new Error("OpenAI handler not implemented");
    },
    generateConversation: async (prompt: string, params: any) => {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful assistant that generates structured JSON data for orders. Format your response as valid JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            ...params,
            response_format: { type: "json_object" },
        });

        return response.choices[0].message.content || "";
    },
};

// Ollama handler implementation
const ollamaHandler: ModelHandler = {
    generateCompletion: async (prompt: string, params: any) => {
        // TODO: Implement Ollama API call
        throw new Error("Ollama handler not implemented");
    },
    generateConversation: async (prompt: string, params: any) => {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama2",
                prompt: `Generate a JSON response for the following request: ${prompt}. 
                Format the response as an array of objects representing a client, product, and order.`,
                ...params,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to generate response from Ollama");
        }

        const data = await response.json();
        return data.response;
    },
};

export async function registerRoutes(app: Express) {
    // Initialize AI configs during startup
    await initializeAIConfigs(storage);

    // Setup Swagger documentation
    setupSwagger(app);

    // Register all route modules
    app.use("/api/schemas", schemaRoutes);
    app.use("/api/libraries", libraryRoutes);
    app.use("/api/ai-configs", aiConfigRoutes);
    app.use("/api/validate", validationRoutes);
    app.use("/api/generate", interfaceGenerationRoutes);
    app.use("/api/stored-prompts", storedPromptsRoutes);
    app.use("/api/client-package", clientPackageRoutes);

    const server = createServer(app);
    return server;
}

//I added this because the original code was missing it, and it was referenced in the edited code.  Without it, the code would not compile.
const mockSchemas = [];
