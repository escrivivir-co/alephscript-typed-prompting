import { Router } from 'express';
import { storage } from '../storage';
import { insertLibrarySchema } from "@shared/schema";
import { ZodError } from "zod";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const libraries = await storage.getLibraries();
    res.json(libraries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch libraries" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const library = await storage.getLibrary(id);

    if (!library) {
      return res.status(404).json({ message: "Library not found" });
    }

    res.json(library);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch library" });
  }
});

router.get("/:id/schemas", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const schemas = await storage.getSchemasByLibrary(id);
    res.json(schemas);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch library schemas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const library = insertLibrarySchema.parse(req.body);
    const created = await storage.createLibrary(library);
    res.json(created);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Failed to create library" });
    }
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const library = insertLibrarySchema.parse(req.body);
    const updated = await storage.updateLibrary(id, library);

    if (!updated) {
      return res.status(404).json({ message: "Library not found" });
    }

    res.json(updated);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Failed to update library" });
    }
  }
});

export default router;
