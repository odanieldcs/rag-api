import { Router } from "express";
import { queryRAG } from "../services/rag.js";
import type { QueryRequest } from "../types.js";

export const ragRouter = Router();

ragRouter.post("/", async (req, res) => {
	try {
		const { question, topK } = req.body as QueryRequest;

		if (!question || typeof question !== "string" || question.trim() === "") {
			return res.status(400).json({
				success: false,
				message: "Question is required",
			});
		}
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
