export interface UploadResponse {
	success: boolean;
	documentId: string;
	chunksCount: number;
	message: string;
}

export interface DocumentChunk {
	id: string;
	text: string;
	metadata: {
		documentId: string;
		chunkIndex: number;
		fileName: string;
		uploadedAt: string;
	};
}

export interface QueryRequest {
	question: string;
	topK: number;
}

export interface SearchResponse {
	id: string;
	text: string;
	score: number;
	metadata: {
		documentId: string;
		fileName: string;
		chunkIndex: number;
		page?: number;
	};
}

export interface QueryResponse {
	question: string;
	results: SearchResponse[];
	retrievedChunks: number;
}

export interface RAGResponse {
	question: string;
	answer: string;
	sources: Array<{
		fileName: string;
		chunkIndex: number;
		score: number;
	}>;
	tokensUsed?: number;
}

export type StreamEventType = "sources" | "token" | "done" | "error";

export interface StreamEvent {
	type: StreamEventType;
	content?: any;
}
