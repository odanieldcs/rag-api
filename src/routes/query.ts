import { Router } from "express";
import { searchDocuments } from "../services/query.js";
import type { QueryRequest } from "../types.js";

export const queryRouter = Router();

queryRouter.post("/", async (req, res) => {
	try {
		const { question, topK } = req.body as QueryRequest;

		if (!question || typeof question !== "string") {
			return res.status(400).json({ error: "Invalid question parameter" });
		}

		if (question.trim().length === 0) {
			return res.status(400).json({ error: "Question cannot be empty" });
		}

		const result = await searchDocuments({ question, topK });

		res.json(result);
	} catch (error) {
		console.error("Error processing query:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
