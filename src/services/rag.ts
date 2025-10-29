import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { Response } from "express";
import type { QueryRequest, RAGResponse } from "../types.js";
import { llm } from "./openai.js";
import { searchDocuments } from "./query.js";

const RAG_PROMPT_TEMPLATE = ChatPromptTemplate.fromMessages([
	[
		"system",
		`You are an AI assistant specialized in answering questions based on the provided context.
    
    Rules:
    - Use only the information provided in the context
    - If the context does not contain the answer, respond with "I did not find the information"
    - Keep your answers concise and to the point
    - Cite the source of your information in the format [source: <document_id>]
    - Answer in Portuguese Brazilian
    `,
	],
	[
		"user",
		`CONTEXT:
    {context}
    QUESTION:
    {question}
    ANSWER:
    `,
	],
]);

export async function queryRAG(query: QueryRequest): Promise<RAGResponse> {
	const { question, topK = 3 } = query;
	// Search relevant chunks
	const searchResults = await searchDocuments({ question, topK });

	if (searchResults.results.length === 0) {
		return {
			question,
			answer: "I did not find the information",
			sources: [],
		};
	}

	// Combine chunks into context
	const context = searchResults.results
		.map((res, idx) => `[${idx + 1}]: ${res.text}`)
		.join("\n\n");

	// Create LLM chain
	const chains = RAG_PROMPT_TEMPLATE.pipe(llm).pipe(new StringOutputParser());

	// Generate answer
	const answer = await chains.invoke({
		context,
		question,
	});

	// Extract sources
	const sources = searchResults.results.map((result) => ({
		fileName: result.metadata.fileName,
		chunkIndex: result.metadata.chunkIndex,
		score: result.score,
	}));

	return {
		question,
		answer,
		sources,
	};
}

export async function streamRAG(
	query: QueryRequest,
	res: Response,
): Promise<void> {
	const { question, topK = 3 } = query;
	// Search relevant chunks
	const searchResults = await searchDocuments({ question, topK });

	if (searchResults.results.length === 0) {
		res.write(
			`data: ${JSON.stringify({
				type: "answer",
				content: "I did not find the information",
			})}\n\n`,
		);
		res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
		res.end();
		return;
	}

	const sources = searchResults.results.map((result) => ({
		fileName: result.metadata.fileName,
		chunkIndex: result.metadata.chunkIndex,
		score: result.score,
	}));

	res.write(
		`data: ${JSON.stringify({
			type: "sources",
			content: sources,
		})}\n\n`,
	);

	// Combine chunks into context
	const context = searchResults.results
		.map((res, idx) => `[${idx + 1}]: ${res.text}`)
		.join("\n\n");

	// Create LLM chain
	const chains = RAG_PROMPT_TEMPLATE.pipe(llm).pipe(new StringOutputParser());

	// Stream answer
	const stream = await chains.stream({
		context,
		question,
	});

	for await (const chunk of stream) {
		res.write(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`);
	}

	res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
	res.end();
}
