import fs from "node:fs/promises";
import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { validateFile } from "../middleware/validation.js";
import { processDocument } from "../services/document.js";

export const documentsRouter = Router();

documentsRouter.post(
	"/upload",
	upload.single("file"),
	validateFile,
	async (req, res) => {
		try {
			const file = req.file!;
			const result = await processDocument(file.path, file.originalname);

			await fs.unlink(file.path);
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
	},
);
