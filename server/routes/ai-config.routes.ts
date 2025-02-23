import { Router } from "express";
import { storage } from "../storage";
import { insertAIConfigSchema, mockAIConfigs, type InsertAIConfig } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

router.post("/init", async (_req, res) => {
    try {
        const existingConfigs = await storage.getAIConfigs();
        if (existingConfigs.length === 0) {
            const createdConfigs = await Promise.all(
                mockAIConfigs.map((config: InsertAIConfig) =>
                    storage.createAIConfig(config)
                )
            );
            res.json(createdConfigs);
        } else {
            res.json({ message: "AI configurations already initialized" });
        }
    } catch (err) {
        res.status(500).json({
            message: "Failed to initialize AI configurations",
        });
    }
});

router.get("/", async (_req, res) => {
    try {
        const configs = await storage.getAIConfigs();
        res.json(configs);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch AI configurations" });
    }
});

router.post("/", async (req, res) => {
    try {
        const config = insertAIConfigSchema.parse(req.body);
        const created = await storage.createAIConfig(config);
        res.json(created);
    } catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({
                message: "Failed to create AI configuration",
            });
        }
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const config = await storage.getAIConfig(id);

        if (!config) {
            return res
                .status(404)
                .json({ message: "AI configuration not found" });
        }

        res.json(config);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch AI configuration" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const config = insertAIConfigSchema.partial().parse(req.body);
        const updated = await storage.updateAIConfig(id, config);

        if (!updated) {
            return res
                .status(404)
                .json({ message: "AI configuration not found" });
        }

        res.json(updated);
    } catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(500).json({
                message: "Failed to update AI configuration",
            });
        }
    }
});

export default router;
