import { Router } from "express";
import { validateSchema } from "../middleware/validation.js";
import { type QueryInput, querySchema } from "../schemas/index.js";
import { queryRAG } from "../services/rag.js";

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
