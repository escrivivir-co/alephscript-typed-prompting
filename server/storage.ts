import fs from "fs/promises";
import path from "path";
import {
    type Schema,
    type InsertSchema,
    type Library,
    type InsertLibrary,
    type AIConfig,
    type InsertAIConfig,
    type StoredPrompt,
    type InsertStoredPrompt,
    type ValidationHistory,
    type InsertValidationHistory,
	mockAIConfigs,
} from "@shared/schema";

// ===== Mock Data =====
export const mockLibrary: InsertLibrary = {
    name: "Common shop interface",
    description:
        "A collection of TypeScript interfaces for e-commerce applications",
};

export const mockSchemas: InsertSchema[] = [
    {
        name: "Product Interface",
        typeScript: `interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
  specifications?: Record<string, string>;
}`,
        jsonSchema: JSON.stringify({
            type: "object",
            properties: {
                id: { type: "number" },
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                category: { type: "string" },
                stock: { type: "number" },
                images: { type: "array", items: { type: "string" } },
                specifications: {
                    type: "object",
                    additionalProperties: { type: "string" },
                },
            },
            required: [
                "id",
                "name",
                "description",
                "price",
                "category",
                "stock",
            ],
        }),
        category: "E-commerce",
        labels: ["product", "shop", "inventory"],
        description: "Standard product interface for e-commerce applications",
        libraryId: 1,
    },
    {
        name: "Spanish Order Schema",
        typeScript: `export interface cliente { id?: number; nombre: string; email?: string; }
export interface producto { id?: number; nombre: string; precio: number; }
export interface orden { id?: number; cliente?: cliente; producto: producto; cantidad: number; }
export type Response = [cliente, producto, orden]`,
        jsonSchema: JSON.stringify({
            type: "array",
            items: [
                {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        nombre: { type: "string" },
                        email: { type: "string" },
                    },
                    required: ["nombre"],
                },
                {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        nombre: { type: "string" },
                        precio: { type: "number" },
                    },
                    required: ["nombre", "precio"],
                },
                {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        cliente: {
                            type: "object",
                            properties: {
                                id: { type: "number" },
                                nombre: { type: "string" },
                                email: { type: "string" },
                            },
                            required: ["nombre"],
                        },
                        producto: {
                            type: "object",
                            properties: {
                                id: { type: "number" },
                                nombre: { type: "string" },
                                precio: { type: "number" },
                            },
                            required: ["nombre", "precio"],
                        },
                        cantidad: { type: "number" },
                    },
                    required: ["producto", "cantidad"],
                },
            ],
            minItems: 3,
            maxItems: 3,
        }),
        category: "E-commerce",
        labels: ["order", "shop", "spanish"],
        description: "Spanish order management interface",
        libraryId: 1,
    },
];

// ===== Storage Interface =====
export interface IStorage {
    // Schema methods
    getSchemas(): Promise<Schema[]>;
    getSchema(id: number): Promise<Schema | undefined>;
    createSchema(schema: InsertSchema): Promise<Schema>;
    updateSchema(
        id: number,
        schema: Partial<InsertSchema>
    ): Promise<Schema | undefined>;

    // AI Config methods
    getAIConfigs(): Promise<AIConfig[]>;
    getAIConfig(id: number): Promise<AIConfig | undefined>;
    createAIConfig(config: InsertAIConfig): Promise<AIConfig>;
    updateAIConfig(
        id: number,
        config: Partial<InsertAIConfig>
    ): Promise<AIConfig | undefined>;

    // Stored Prompts methods
    getStoredPrompts(): Promise<StoredPrompt[]>;
    getStoredPrompt(id: number): Promise<StoredPrompt | undefined>;
    createStoredPrompt(prompt: InsertStoredPrompt): Promise<StoredPrompt>;
    updateStoredPrompt(
        id: number,
        prompt: Partial<InsertStoredPrompt>
    ): Promise<StoredPrompt | undefined>;
    deleteStoredPrompt(id: number): Promise<void>;

    // Validation History methods
    getValidationHistories(schemaId: number): Promise<ValidationHistory[]>;
    getValidationHistory(id: number): Promise<ValidationHistory | undefined>;
    createValidationHistory(
        history: InsertValidationHistory
    ): Promise<ValidationHistory>;

    // Library methods
    getLibraries(): Promise<Library[]>;
    getLibrary(id: number): Promise<Library | undefined>;
    createLibrary(library: InsertLibrary): Promise<Library>;
    updateLibrary(
        id: number,
        library: Partial<InsertLibrary>
    ): Promise<Library | undefined>;
    getSchemasByLibrary(libraryId: number): Promise<Schema[]>;
}

// Add the storage file path constant
const STORAGE_FILE = path.join(process.cwd(), "data", "stored-prompts.json");

// ===== Memory Storage Implementation =====
class MemoryStorage implements IStorage {
	private schemas: Schema[] = [];
	private libraries: Library[] = [];
	private aiConfigs: AIConfig[] = [];
	private storedPrompts: StoredPrompt[] = [];
	private validationHistories: ValidationHistory[] = [];

	private schemaCounter = 1;
	private libraryCounter = 1;
	private aiConfigCounter = 1;
	private storedPromptCounter = 1;
	private validationHistoryCounter = 1;

	constructor() {
		this.initializeData();
		this.loadAllData();
	}

	// ===== Private Persistence Methods =====
	private async loadAllData() {
		try {
			await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });
			const data = await fs.readFile(STORAGE_FILE, "utf-8");
			const loaded = JSON.parse(data);
			this.schemas = loaded.schemas || this.schemas;
			this.libraries = loaded.libraries || this.libraries;
			this.aiConfigs = loaded.aiConfigs || this.aiConfigs;
			this.storedPrompts = loaded.storedPrompts || this.storedPrompts;
			this.validationHistories = loaded.validationHistories || this.validationHistories;
			this.schemaCounter = loaded.schemaCounter || this.schemaCounter;
			this.libraryCounter = loaded.libraryCounter || this.libraryCounter;
			this.aiConfigCounter = loaded.aiConfigCounter || this.aiConfigCounter;
			this.storedPromptCounter = loaded.storedPromptCounter || this.storedPromptCounter;
			this.validationHistoryCounter = loaded.validationHistoryCounter || this.validationHistoryCounter;
		} catch (error) {
			// No persisted file yet; save initial state.
			await this.saveAllData();
		}
	}

	private async saveAllData() {
		const data = {
			schemas: this.schemas,
			libraries: this.libraries,
			aiConfigs: this.aiConfigs,
			storedPrompts: this.storedPrompts,
			validationHistories: this.validationHistories,
			schemaCounter: this.schemaCounter,
			libraryCounter: this.libraryCounter,
			aiConfigCounter: this.aiConfigCounter,
			storedPromptCounter: this.storedPromptCounter,
			validationHistoryCounter: this.validationHistoryCounter,
		};
		try {
			await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });
			await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
		} catch (error) {
			console.error("Error saving data:", error);
		}
	}

	private initializeData() {
		// Initialize library if empty
		if (this.libraries.length === 0) {
			const library: Library = {
				id: this.libraryCounter++,
				name: mockLibrary.name,
				description: mockLibrary.description || null,
				createdAt: new Date().toISOString(),
			};
			this.libraries.push(library);
		}

		// Initialize schemas if empty
		if (this.schemas.length === 0) {
			this.schemas = mockSchemas.map((schema) => ({
				id: this.schemaCounter++,
				...schema,
				category: schema.category || "uncategorized",
				labels: schema.labels || [],
				description: schema.description || null,
				createdAt: new Date().toISOString(),
				libraryId: schema.libraryId || this.libraries[0].id,
			}));
		}

		// Initialize AI configs if empty
		if (this.aiConfigs.length === 0) {
			this.aiConfigs = mockAIConfigs.map((config) => ({
				id: this.aiConfigCounter++,
				...config,
				apiKey: null,
				baseUrl: null,
				isActive: true,
				models: config.models || [],
				createdAt: new Date().toISOString(),
			}));
		}
	}

	// ===== Schema Methods =====
	async getSchemas(): Promise<Schema[]> {
		return this.schemas;
	}

	async getSchema(id: number): Promise<Schema | undefined> {
		return this.schemas.find((schema) => schema.id === id);
	}

	async createSchema(schema: InsertSchema): Promise<Schema> {
		const newSchema: Schema = {
			id: this.schemaCounter++,
			...schema,
			category: schema.category || "uncategorized",
			labels: schema.labels || [],
			description: schema.description || null,
			createdAt: new Date().toISOString(),
			libraryId: schema.libraryId || null,
		};
		this.schemas.push(newSchema);
		await this.saveAllData();
		return newSchema;
	}

	async updateSchema(
		id: number,
		schema: Partial<InsertSchema>
	): Promise<Schema | undefined> {
		const index = this.schemas.findIndex((s) => s.id === id);
		if (index === -1) return undefined;

		this.schemas[index] = {
			...this.schemas[index],
			...schema,
		};
		await this.saveAllData();
		return this.schemas[index];
	}

	// ===== AI Config Methods =====
	async getAIConfigs(): Promise<AIConfig[]> {
		return this.aiConfigs;
	}

	async getAIConfig(id: number): Promise<AIConfig | undefined> {
		return this.aiConfigs.find((config) => config.id === id);
	}

	async createAIConfig(config: InsertAIConfig): Promise<AIConfig> {
		const newConfig: AIConfig = {
			id: this.aiConfigCounter++,
			name: config.name,
			provider: config.provider,
			apiKey: config.apiKey || null,
			baseUrl: config.baseUrl || null,
			models: config.models || [],
			isActive: true,
			settings: JSON.stringify(config.settings || {}),
			createdAt: new Date().toISOString(),
		};
		this.aiConfigs.push(newConfig);
		await this.saveAllData();
		return newConfig;
	}

	async updateAIConfig(
		id: number,
		config: Partial<InsertAIConfig>
	): Promise<AIConfig | undefined> {
		const index = this.aiConfigs.findIndex((c) => c.id === id);
		if (index === -1) return undefined;

		const current = this.aiConfigs[index];
		this.aiConfigs[index] = {
			...current,
			...config,
			settings: config.settings ? JSON.stringify(config.settings) : current.settings,
		};
		await this.saveAllData();
		return this.aiConfigs[index];
	}

	// ===== Stored Prompts Methods =====
	async getStoredPrompts(): Promise<StoredPrompt[]> {
		return this.storedPrompts;
	}

	async getStoredPrompt(id: number): Promise<StoredPrompt | undefined> {
		return this.storedPrompts.find((prompt) => prompt.id === id);
	}

	async createStoredPrompt(prompt: InsertStoredPrompt): Promise<StoredPrompt> {
		const newPrompt: StoredPrompt = {
			id: this.storedPromptCounter++,
			name: prompt.name,
			content: prompt.content,
			modelId: prompt.modelId,
			modelName: prompt.modelName,
			schemaId: prompt.schemaId,
			modelParams: JSON.stringify(prompt.modelParams || {}),
			type: prompt.type,
			libraryId: prompt.libraryId,
			libraryName: prompt.libraryName,
			selectedSchemas: prompt.selectedSchemas,
			rawOutgoingPrompt: prompt.rawOutgoingPrompt,
			rawIncomingResponse: prompt.rawIncomingResponse,
			createdAt: new Date().toISOString(),
		};
		this.storedPrompts.push(newPrompt);
		await this.saveAllData();
		return newPrompt;
	}

	async updateStoredPrompt(
		id: number,
		prompt: Partial<InsertStoredPrompt>
	): Promise<StoredPrompt | undefined> {
		const index = this.storedPrompts.findIndex((p) => p.id === id);
		if (index === -1) return undefined;

		const current = this.storedPrompts[index];
		const updatedPrompt: StoredPrompt = {
			...current,
			...prompt,
			modelParams: prompt.modelParams ? JSON.stringify(prompt.modelParams) : current.modelParams,
			createdAt: current.createdAt,
		};

		this.storedPrompts[index] = updatedPrompt;
		await this.saveAllData();
		return updatedPrompt;
	}

	async deleteStoredPrompt(id: number): Promise<void> {
		const index = this.storedPrompts.findIndex((p) => p.id === id);
		if (index !== -1) {
			this.storedPrompts.splice(index, 1);
			await this.saveAllData();
		}
	}

	// ===== Validation History Methods =====
	async getValidationHistories(schemaId: number): Promise<ValidationHistory[]> {
		return this.validationHistories.filter((history) => history.schemaId === schemaId);
	}

	async getValidationHistory(id: number): Promise<ValidationHistory | undefined> {
		return this.validationHistories.find((history) => history.id === id);
	}

	async createValidationHistory(history: InsertValidationHistory): Promise<ValidationHistory> {
		const newHistory: ValidationHistory = {
			id: this.validationHistoryCounter++,
			schemaId: history.schemaId,
			prompt: history.prompt,
			response: history.response,
			validationReport: history.validationReport,
			isValid: history.isValid,
			createdAt: new Date().toISOString(),
		};
		this.validationHistories.push(newHistory);
		await this.saveAllData();
		return newHistory;
	}

	// ===== Library Methods =====
	async getLibraries(): Promise<Library[]> {
		return this.libraries;
	}

	async getLibrary(id: number): Promise<Library | undefined> {
		return this.libraries.find((lib) => lib.id === id);
	}

	async createLibrary(library: InsertLibrary): Promise<Library> {
		const newLibrary: Library = {
			id: this.libraryCounter++,
			name: library.name,
			description: library.description || null,
			createdAt: new Date().toISOString(),
		};
		this.libraries.push(newLibrary);
		await this.saveAllData();
		return newLibrary;
	}

	async updateLibrary(id: number, library: Partial<InsertLibrary>): Promise<Library | undefined> {
		const index = this.libraries.findIndex((l) => l.id === id);
		if (index === -1) return undefined;

		this.libraries[index] = {
			...this.libraries[index],
			...library,
		};
		await this.saveAllData();
		return this.libraries[index];
	}

	async getSchemasByLibrary(libraryId: number): Promise<Schema[]> {
		return this.schemas.filter((schema) => schema.libraryId === libraryId);
	}
}

export const storage = new MemoryStorage();
