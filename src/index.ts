import express from "express";
import { config } from "./config.js";
import { initQdrantCollection } from "./services/qdrant.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
	res.send("OK");
});

async function start() {
	try {
		await initQdrantCollection();

		app.listen(config.server.port, () => {
			console.log(`✔︎ Server is running on port ${config.server.port}`);
		});
	} catch (error) {
		console.error("✕ Error starting server:", error);
		process.exit(1);
	}
}

start();
