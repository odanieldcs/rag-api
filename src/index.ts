import fs from "node:fs";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { documentsRouter } from "./routes/document.js";
import { queryRouter } from "./routes/query.js";
import { ragRouter } from "./routes/rag.js";
import { initQdrantCollection } from "./services/qdrant.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
	res.send("OK");
});

app.use("/documents", documentsRouter);
app.use("/query", queryRouter);
app.use("/rag", ragRouter);
app.use(errorHandler);

// ensure the uploads directory exists, create if it doesn't
if (!fs.existsSync(config.uploads.directory)) {
	fs.mkdirSync(config.uploads.directory);
}

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
