import { OpenAI } from "openai";

// Update model handlers to support conversation responses
export interface ModelHandler {
    generateTypeCompletion: (prompt: string, params: any) => Promise<string>;
    generateConversation: (prompt: string, params: any) => Promise<string>;
}

// OpenAI handler implementation
export const openAIHandler: ModelHandler = {
    generateTypeCompletion: async (prompt: string, params: any) => {
        const openai = new OpenAI({ apiKey: params.settings.apiKey });
        delete params.settings;
        // Common model parameters
        const commonModelParams = {
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            ...params,
        };

        let response;
        try {
            response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a helpful assistant that generates structured typescript code. You analyze user input and modelize using valid typescript interfaces and types. Format your response as valid JSON. Use following interface to fill your valid typescript code: ```ts { content: [ { name: string; type: 'type | interface'; code: string; } ] }``` where you provide and array of needed types or interfaces",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                ...commonModelParams,
                ...params,
                response_format: { type: "json_object" },
            });
        } catch (error) {
            console.log("Error in OpenAI model handler:", error);
            throw new Error("Failed to generate response from OpenAI");
        }

        return response.choices[0].message.content || "{}"; // Ensure we never return null
    },
    generateConversation: async (prompt: string, params: any) => {
        const openai = new OpenAI({ apiKey: params.settings.apiKey });

		const messages = [
			{
				role: "system",
				content:
					"You are an expert code engine that helps by translating user natural lenguage to transpilable TypeScript code. You receive a set of TypeScript interfaces and types; and a user prompt asking you to provide valid runnable Typescript code modeling the user input. Format your response as valid JSON. Response TypedMessage: { content: T; } where you provide the code to be transpiled. These are the references you must align: " + params.context_window.library,
			},
			{
				role: "user",
				content: prompt,
			},
		]

        delete params.settings;
		delete params.context_window;
        // Common model parameters
        const commonModelParams = {
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            ...params,
        };

        let response;
        try {
            response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages,
                ...commonModelParams,
                ...params,
                response_format: { type: "json_object" },
            });
        } catch (error) {
            console.log("Error in OpenAI model handler:", error);
            throw new Error("Failed to generate response from OpenAI");
        }

        return response.choices[0].message.content || "{}"; // Ensure we never return null
    },
};

// Ollama handler implementation
export const ollamaHandler: ModelHandler = {
    generateTypeCompletion: async (prompt: string, params: any) => {
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
        return data.response || "{}"; // Ensure we never return null
    },
};

// Helper function to get appropriate model handler
export function getModelHandler(provider: string): ModelHandler {
    switch (provider?.toLowerCase()) {
        case "openai":
            return openAIHandler;
        case "ollama":
            return ollamaHandler;
        default:
            throw new Error(`Unsupported model provider: ${provider}`);
    }
}
