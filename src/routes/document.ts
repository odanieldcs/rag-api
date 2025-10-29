import fs from "node:fs/promises";
import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { processDocument } from "../services/document.js";

export const documentsRouter = Router();

documentsRouter.post("/upload", upload.single("file"), async (req, res) => {
	try {
		if (!req.file) {
			return res
				.status(400)
				.json({ success: false, message: "No file uploaded" });
		}
		const result = await processDocument(req.file.path, req.file.originalname);

		await fs.unlink(req.file.path);
		res.json(result);
	} catch (error) {
		if (req.file?.path) {
			await fs.unlink(req.file.path);
		}
		console.error(`Error processing document:`, error);
		res
			.status(500)
			.json({ success: false, message: "Error processing document" });
	}
});
