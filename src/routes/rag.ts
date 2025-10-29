import { Router } from "express";
import { validateSchema } from "../middleware/validation.js";
import { type QueryInput, querySchema } from "../schemas/index.js";
import { queryRAG, streamRAG } from "../services/rag.js";

export const ragRouter = Router();

ragRouter.post("/", validateSchema(querySchema), async (req, res) => {
	try {
		const { question, topK } = req.body as QueryInput;
		const result = await queryRAG({ question, topK });
		res.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.log("Error processing RAG query:", error);
		res.status(500).json({
			success: false,
			message: "Error processing RAG query",
		});
	}
});

ragRouter.post(
	"/stream",
	validateSchema(querySchema),
	async (req, res, next) => {
		const startTime = Date.now();

		try {
			const { question, topK } = req.body as QueryInput;

			// Set headers for SSE
			res.setHeader("Content-Type", "text/event-stream");
			res.setHeader("Cache-Control", "no-cache");
			res.setHeader("Connection", "keep-alive");

			await streamRAG({ question, topK }, res);
			const duration = Date.now() - startTime;

			console.log(`Streamed RAG response in ${duration}ms`);
		} catch (error) {
			res.write(
				`data: ${JSON.stringify({ success: false, message: "Error processing RAG stream query" })}\n\n`,
			);
			res.end();
			console.log("Error processing RAG stream query:", error);
		}
	},
);
