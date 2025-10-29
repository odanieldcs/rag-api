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
