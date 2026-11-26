import fs from "node:fs/promises";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFParse } from "pdf-parse";
import { config } from "../config.js";
import type { UploadResponse } from "../types.js";
import { embeddings } from "./openai.js";
import { qdrantClient } from "./qdrant.js";

const textSplitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});

// Load a PDF as one Document per non-empty page, keeping the page number in metadata.loc
async function loadPdf(filePath: string): Promise<Document[]> {
	const parser = new PDFParse({ data: await fs.readFile(filePath) });

	try {
		const { pages } = await parser.getText();

		return pages
			.filter((page) => page.text.trim().length > 0)
			.map(
				(page) =>
					new Document({
						pageContent: page.text,
						metadata: { loc: { pageNumber: page.num } },
					}),
			);
	} finally {
		await parser.destroy();
	}
}

export async function processDocument(
	filePath: string,
	fileName: string,
): Promise<UploadResponse> {
	// 1. Load the document from the file
	const documents = await loadPdf(filePath);

	if (documents.length === 0) {
		throw new Error("No documents found in the provided file.");
	}

	// 2. Split the document into chunks
	const chunks = await textSplitter.splitDocuments(documents);

	if (chunks.length === 0) {
		throw new Error("Failed to split the document into chunks.");
	}

	// 3. Add metadata to each chunk
	const documentId = crypto.randomUUID();
	const documentChunks = chunks.map((chunk, index) => ({
		id: crypto.randomUUID(),
		text: chunk.pageContent,
		metadata: {
			documentId,
			chunkIndex: index,
			fileName,
			uploadedAt: new Date().toISOString(),
			page: chunk.metadata.loc?.pageNumber,
		},
	}));

	// 4. Generate embeddings
	const texts = documentChunks.map((chunk) => chunk.text);
	const vectors = await embeddings.embedDocuments(texts);

	// 5. Prepare points for vector database insertion
	const points = documentChunks.map((chunk, index) => {
		const vector = vectors[index];

		if (!vector || !Array.isArray(vector)) {
			throw new Error(`Invalid vector at index ${index}`);
		}

		return {
			id: chunk.id,
			vector,
			payload: {
				text: chunk.text,
				...chunk.metadata,
			},
		};
	});

	// 6. Insert points into the vector database
	await qdrantClient.upsert(config.qdrant.collectionName, {
		wait: true,
		points,
	});

	return {
		success: true,
		documentId,
		chunksCount: documentChunks.length,
		message: "Document processed and stored successfully.",
	};
}
