import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { config } from "../config.js";

export const embeddings = new OpenAIEmbeddings({
	openAIApiKey: config.openai.apiKey,
	model: "text-embedding-3-small",
	maxRetries: 2, // Tenta novamente em caso de falha
	timeout: 10000, // Tempo limite de 10 segundos
});

export const llm = new ChatOpenAI({
	openAIApiKey: config.openai.apiKey,
	model: "gpt-4o-mini", // Modelo otimizado para custo e desempenho
	temperature: 0, // Respostas mais determinísticas / menos criativas
	maxRetries: 2, // Tenta novamente em caso de falha
	timeout: 30000, // Tempo limite de 30 segundos
});
