import path from "node:path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config.js";

const storage = multer.diskStorage({
	destination: config.uploads.directory,
	filename: (_, file, cb) => {
		const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
		cb(null, uniqueName);
	},
});

export const upload = multer({
	storage,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10 MB limit
	},
	fileFilter: (_, file, cb) => {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
		} else {
			cb(new Error("Only PDF files are allowed"));
		}
	},
});
