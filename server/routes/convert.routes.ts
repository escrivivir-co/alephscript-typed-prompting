import { Router } from "express";
import { convertTypeScriptToJsonSchema } from "./converter";

const router = Router();

/**
 * Convert TypeScript interface to JSON Schema
 * POST /api/convert
 * Body: { typescript: string, name?: string }
 * Response: { jsonSchema: string } or { error: string }
 */
router.post("/", async (req, res) => {
    try {
        const { typescript, name } = req.body;
        
        if (!typescript || typeof typescript !== "string") {
            return res.status(400).json({ 
                error: "Missing or invalid 'typescript' field" 
            });
        }

        const jsonSchema = await convertTypeScriptToJsonSchema(typescript);
        res.json({ jsonSchema, name: name || "ConvertedSchema" });
    } catch (err: any) {
        res.status(500).json({ 
            error: err.message || "Failed to convert TypeScript to JSON Schema" 
        });
    }
});

export default router;
