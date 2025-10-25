import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { config } from "../config.js";

export const embeddings = new OpenAIEmbeddings({
	openAIApiKey: config.openai.apiKey,
	model: "text-embedding-3-small",
});

export const llm = new ChatOpenAI({
	openAIApiKey: config.openai.apiKey,
	model: "gpt-4o-mini", // Modelo otimizado para custo e desempenho
	temperature: 0, // Respostas mais determinísticas / menos criativas
});
