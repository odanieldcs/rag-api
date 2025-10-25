import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "../config.js";

export const qdrantClient = new QdrantClient({
	url: config.qdrant.url,
});

export async function initQdrantCollection() {
	const collections = await qdrantClient.getCollections();

	const exists = collections.collections.some(
		(col) => col.name === config.qdrant.collectionName,
	);

	if (!exists) {
		await qdrantClient.createCollection(config.qdrant.collectionName, {
			vectors: {
				size: 1536, // Tamanho do vetor do OpenAI Embedding para text-embedding-3-small
				distance: "Cosine", // Métrica padrão de similaridade para embeddings de texto
			},
		});

		console.log(`✔︎ Collection '${config.qdrant.collectionName}' created.`);
	} else {
		console.log(
			`✔︎ Collection '${config.qdrant.collectionName}' already exists.`,
		);
	}
}
