import { Router } from "express";
import { storage } from "../storage";
import { EventEmitter } from "events";
import { getModelHandler } from "../handlers/model-handlers";

const router = Router();

router.post("/interface", async (req, res) => {
    try {
        const { prompt, model, params, type = "typing" } = req.body;

        if (!prompt || !model) {
            return res
                .status(400)
                .json({ error: "Prompt and model are required" });
        }

        const aiConfig = await storage.getAIConfig(parseInt(model));
        if (!aiConfig) {
            return res.status(404).json({ error: "Selected model not found" });
        }

        // Set headers for SSE
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Create event emitter for streaming
        const emitter = new EventEmitter();
        const streamId = Math.random().toString(36).slice(2);

        // Store the emitter for cleanup
        if (!req.app.locals.streamEmitters) {
            req.app.locals.streamEmitters = new Map();
        }
        req.app.locals.streamEmitters.set(streamId, emitter);

        // Send stream ID to client
        res.write(`data: ${JSON.stringify({ streamId })}\n\n`);

        // Merge default settings from AI config with user provided params
        const finalParams = {
            settings: aiConfig || {},
            ...(params || {}),
        };

        let response = "";

        // Generate response based on model type
        if (aiConfig.name === "Dummy Model") {
            response =
                type === "typing"
                    ? JSON.stringify([
                          {
                              name: "User",
                              code: "export interface User { id: number; name: string; email: string; }",
                          },
                          {
                              name: "Product",
                              code: "export interface Product { id: number; name: string; price: number; }",
                          },
                          {
                              name: "Order",
                              code: "export interface Order { id: number; userId: number; productId: number; quantity: number; }",
                          },
                      ])
                    : `interface ConversationResponse {
            message: string;
            timestamp: string;
            status: 'success' | 'error';
          }`;
        } else {
            try {
                const handler = getModelHandler(aiConfig.provider);
                response = await handler.generateTypeCompletion(
                    prompt,
                    finalParams
                );
            } catch (error) {
                console.error("Model handler error:", error);
                return res
                    .status(500)
                    .json({ error: "Failed to generate response from model" });
            }
        }

        // Stream the response
        const words = [response]; // TODO
        let currentResponse = "";

        const interval = setInterval(() => {
            if (words.length > 0) {
                const word = words.shift();
                currentResponse += word + " ";

                try {
                    if (type === "typing") {
                        try {
                            JSON.parse(currentResponse);
                            res.write(
                                `data: ${JSON.stringify({
                                    typescript: JSON.parse(currentResponse).content,
                                })}\n\n`
                            );
                        } catch {
                            // Skip partial JSON
                        }
                    } else {
                        res.write(
                            `data: ${JSON.stringify({
                                typescript: currentResponse.trim(),
                            })}\n\n`
                        );
                    }
                } catch (e) {
                    console.error("Error sending chunk:", e);
                }
            } else {
                clearInterval(interval);
                emitter.emit("end");
                res.write("event: end\ndata: {}\n\n");
                res.end();
                req.app.locals.streamEmitters.delete(streamId);
            }
        }, 100);

        // Handle client disconnect
        req.on("close", () => {
            clearInterval(interval);
            req.app.locals.streamEmitters.delete(streamId);
        });
    } catch (error) {
        console.error("Error generating interface:", error);
        res.status(500).json({ error: "Failed to generate interface" });
    }
});

router.post("/conversation", async (req, res) => {
    try {
        const { prompt, model, params, type = "conversation", schemaId } = req.body;

        if (!prompt || !model) {
            return res
                .status(400)
                .json({ error: "Prompt and model are required" });
        }

        const aiConfig = await storage.getAIConfig(parseInt(model));
        if (!aiConfig) {
            return res.status(404).json({ error: "Selected model not found" });
        }

        // Set headers for SSE
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Create event emitter for streaming
        const emitter = new EventEmitter();
        const streamId = Math.random().toString(36).slice(2);

        // Store the emitter for cleanup
        if (!req.app.locals.streamEmitters) {
            req.app.locals.streamEmitters = new Map();
        }
        req.app.locals.streamEmitters.set(streamId, emitter);

        // Send stream ID to client
        res.write(`data: ${JSON.stringify({ streamId })}\n\n`);

        // Merge default settings from AI config with user provided params
		const schema = await storage.getSchema(parseInt(schemaId))
        const finalParams = {
			settings: aiConfig || {},
			context_window: { library: schema?.typeScript },
            ...(params || {})
        };

        let response = "";
		let fakeresponse = "";	
		fakeresponse = JSON.stringify({
			"content": "{\"content\":{\"id\":\"order123\",\"items\":[{\"product\":{\"id\":\"pizza-barbacoa\",\"name\":\"Barbacoa Pizza\",\"price\":12.99,\"quantityAvailable\":10},\"quantity\":1},{\"product\":{\"id\":\"hot-dog\",\"name\":\"Hot Dog\",\"price\":3.5,\"quantityAvailable\":20},\"quantity\":2},{\"product\":{\"id\":\"ice-cube\",\"name\":\"Ice Cube\",\"price\":0.5,\"quantityAvailable\":100},\"quantity\":1}],\"totalAmount\":20.49,\"status\":\"pending\",\"orderDate\":\"2023-10-10T12:00:00Z\",\"customerName\":\"Bob\",\"shippingAddress\":\"123 Main St, Anytown, USA\"}}"
		});
        // Generate response based on model type
        if (aiConfig.name === "Dummy Model") {
            response = fakeresponse;
        } else {
            try {

                const handler = getModelHandler(aiConfig.provider);
                response = await handler.generateConversation(
                    prompt,
                    finalParams
                );
            } catch (error) {
                console.error("Model handler error:", error);
                return res
                    .status(500)
                    .json({ error: "Failed to generate response from model" });
            }
        }

        // Stream the response
        const words = [fakeresponse];
        let currentResponse = "";

        const interval = setInterval(() => {
            if (words.length > 0) {
                const word = words.shift();
                currentResponse += word + " ";

                try {
                    if (type !== "typing") {
                        try {
                            JSON.parse(currentResponse);
                            res.write(
                                `data: ${JSON.stringify({
                                    response: JSON.parse(currentResponse),
                                })}\n\n`
                            );
                        } catch {
                            // Skip partial JSON
                        }
                    } else {
                        res.write(
                            `data: ${JSON.stringify({
                                content: currentResponse.trim(),
                            })}\n\n`
                        );
                    }
                } catch (e) {
                    console.error("Error sending chunk:", e);
                }
            } else {
                clearInterval(interval);
                emitter.emit("end");
                res.write("event: end\ndata: {}\n\n");
                res.end();
                req.app.locals.streamEmitters.delete(streamId);
            }
        }, 100);

        // Handle client disconnect
        req.on("close", () => {
            clearInterval(interval);
            req.app.locals.streamEmitters.delete(streamId);
        });
    } catch (error) {
        console.error("Error generating interface:", error);
        res.status(500).json({ error: "Failed to generate interface" });
    }
});

router.post("/stop", (req, res) => {
    const { streamId } = req.body;
    if (!streamId || !req.app.locals.streamEmitters) {
        return res.status(400).json({ error: "Invalid stream ID" });
    }

    const emitter = req.app.locals.streamEmitters.get(streamId);
    if (emitter) {
        emitter.emit("stop");
        req.app.locals.streamEmitters.delete(streamId);
        res.json({ message: "Generation stopped" });
    } else {
        res.status(404).json({ error: "Stream not found" });
    }
});

export default router;
