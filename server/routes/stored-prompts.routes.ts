import { Router } from 'express';
import { storage } from '../storage';
import { insertStoredPromptSchema, insertValidationHistorySchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const type = req.query.type as string;
    const prompts = await storage.getStoredPrompts();

    // Filter by type if specified
    const filteredPrompts = type
      ? prompts.filter(prompt => prompt.type === type)
      : prompts;

    res.json(filteredPrompts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stored prompts" });
  }
});

router.post("/", async (req, res) => {
  try {
    const prompt = insertStoredPromptSchema.parse(req.body);
    const created = await storage.createStoredPrompt(prompt);
    res.json(created);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Failed to create stored prompt" });
    }
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const prompt = await storage.getStoredPrompt(id);
    if (!prompt) {
      return res.status(404).json({ message: "Stored prompt not found" });
    }
    res.json(prompt);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stored prompt" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const prompt = insertStoredPromptSchema.partial().parse(req.body);
    const updated = await storage.updateStoredPrompt(id, prompt);
    if (!updated) {
      return res.status(404).json({ message: "Stored prompt not found" });
    }
    res.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Failed to update stored prompt" });
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteStoredPrompt(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Failed to delete stored prompt" });
  }
});

// Validation History Routes
router.get("/:id/history", async (req, res) => {
  try {
    const promptId = parseInt(req.params.id);
    const histories = await storage.getValidationHistories(promptId);
    res.json(histories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch validation histories" });
  }
});

router.post("/:id/history", async (req, res) => {
  try {
    const promptId = parseInt(req.params.id);
    const history = insertValidationHistorySchema.parse({
      ...req.body,
      promptId,
    });
    const created = await storage.createValidationHistory(history);
    res.json(created);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Failed to create validation history" });
    }
  }
});

export default router;
