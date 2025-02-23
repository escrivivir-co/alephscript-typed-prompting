import { type Express } from "express";
import swaggerUi from "swagger-ui-express";

export const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "TypeScript to JSON Schema Converter API",
        version: "1.0.0",
        description:
            "API documentation for the TypeScript to JSON Schema converter",
    },
    servers: [
        {
            url: "/api",
            description: "Development server",
        },
    ],
    paths: {
        "/schemas": {
            get: {
                summary: "Get all schemas",
                responses: {
                    "200": {
                        description: "List of all schemas",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Schema",
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                summary: "Create a new schema",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/InsertSchema",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Schema created successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Schema",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/libraries": {
            get: {
                summary: "Get all libraries",
                responses: {
                    "200": {
                        description: "List of all libraries",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Library",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/ai-configs": {
            get: {
                summary: "Get all AI configurations",
                responses: {
                    "200": {
                        description: "List of all AI configurations",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/AIConfig",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/validate/{id}": {
            post: {
                summary: "Validate JSON against a schema",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                        },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                            },
                        },
                    },
                },
                responses: {
                    "200": {
                        description: "Validation result",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ValidationReport",
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            Schema: {
                type: "object",
                properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    typeScript: { type: "string" },
                    jsonSchema: { type: "string" },
                    category: { type: "string" },
                    labels: {
                        type: "array",
                        items: { type: "string" },
                    },
                    description: {
                        type: "string",
                        nullable: true,
                    },
                    libraryId: {
                        type: "integer",
                        nullable: true,
                    },
                    createdAt: { type: "string" },
                },
            },
            InsertSchema: {
                type: "object",
                required: ["name", "typeScript", "jsonSchema"],
                properties: {
                    name: { type: "string" },
                    typeScript: { type: "string" },
                    jsonSchema: { type: "string" },
                    category: { type: "string" },
                    labels: {
                        type: "array",
                        items: { type: "string" },
                    },
                    description: { type: "string" },
                    libraryId: { type: "integer" },
                },
            },
            ValidationReport: {
                type: "object",
                properties: {
                    valid: { type: "boolean" },
                    errors: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                path: { type: "string" },
                                message: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },
};

export function setupSwagger(app: Express) {
    app.get("/api-docs.json", (_req, res) => {
        res.json(swaggerDocument);
    });

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, {
            explorer: true,
            customSiteTitle: "TypeScript Schema Validator API Documentation",
        })
    );
}
