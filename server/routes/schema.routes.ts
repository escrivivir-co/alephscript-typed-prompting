import { Router } from "express";
import { storage } from "../storage";
import { insertSchemaSchema } from "@shared/schema";
import { ZodError } from "zod";
import { mockSchemas } from "../storage";
import { convertTypeScriptToJsonSchema } from "./converter";

const router = Router();

// Add initialization endpoint for schemas
router.post("/init", async (_req, res) => {
    try {
        const existingSchemas = await storage.getSchemas();
        if (existingSchemas.length === 0) {
            const createdSchemas = await Promise.all(
                mockSchemas.map((schema) => storage.createSchema(schema))
            );
            res.json(createdSchemas);
        } else {
            res.json({ message: "Schemas already initialized" });
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to initialize schemas" });
    }
});

// Get all schemas
router.get("/", async (_req, res) => {
    const schemas = await storage.getSchemas();
    res.json(schemas);
});

// Create new schema
router.post("/", async (req, res) => {
    try {
        const schema = insertSchemaSchema.parse(req.body);
		schema.jsonSchema = await convertTypeScriptToJsonSchema(schema.typeScript);
        const created = await storage.createSchema(schema);
        res.json(created);
    } catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
});

// Update schema
router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const schema = insertSchemaSchema.partial().parse(req.body);
		schema.jsonSchema = await convertTypeScriptToJsonSchema(schema.typeScript || "");
        const updated = await storage.updateSchema(id, schema);

        if (!updated) {
            return res.status(404).json({ message: "Schema not found" });
        }

        res.json(updated);
    } catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({ message: "Internal server error" });
        }
    }
});

// Get single schema
router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const schema = await storage.getSchema(id);

        if (!schema) {
            return res.status(404).json({ message: "Schema not found" });
        }

        res.json(schema);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});


export default router;
