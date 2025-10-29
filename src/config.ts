import dotenv from "dotenv";

dotenv.config();

const MAX_FILE_SIZE_10MB = 10 * 1024 * 1024;

export const config = {
	openai: {
		// biome-ignore lint/style/noNonNullAssertion: We ensure this variable is set below
		apiKey: process.env.OPENAI_API_KEY!,
	},
	qdrant: {
		url: process.env.QDRANT_URL || "http://localhost:6333",
		collectionName: process.env.QDRANT_COLLECTION_NAME || "documents",
	},
	server: {
		port: process.env.SERVER_PORT || "3000",
	},
	uploads: {
		directory: process.env.UPLOADS_DIRECTORY || "./uploads",
		maxFileSize: Number(MAX_FILE_SIZE_10MB),
	},
} as const;

if (!config.openai.apiKey) {
	throw new Error("OPENAI_API_KEY is not set in environment variables");
}
