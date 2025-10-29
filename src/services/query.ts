import { config } from "../config.js";
import type { QueryRequest, QueryResponse, SearchResponse } from "../types.js";
import { embeddings } from "./openai.js";
import { qdrantClient } from "./qdrant.js";

export async function searchDocuments({
	question,
	topK = 3,
}: QueryRequest): Promise<QueryResponse> {
	// Generate embedding for the query question
	const queryVector = await embeddings.embedQuery(question);

	// Perform vector search in Qdrant
	const searchResult = await qdrantClient.search(config.qdrant.collectionName, {
		vector: queryVector,
		limit: topK,
		with_payload: true,
	});

	// Map search results to the SearchResponse format
	const results: SearchResponse[] = searchResult.map((result) => ({
		id: result.id as string,
		text: result.payload?.text as string,
		score: result.score,
		metadata: {
			documentId: result.payload?.documentId as string,
			fileName: result.payload?.fileName as string,
			chunkIndex: result.payload?.chunkIndex as number,
			page: result.payload?.page as number,
		},
	}));

	return {
		question,
		results,
		retrievedChunks: results.length,
	};
}
