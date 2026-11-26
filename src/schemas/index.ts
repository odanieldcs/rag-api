import { z } from "zod";
import { config } from "../config.js";

export const querySchema = z.object({
	question: z
		.string({
			error: (issue) =>
				issue.input === undefined
					? "Question is required"
					: "Question must be a string",
		})
		.min(1, "Question cannot be empty")
		.max(500, "Question cannot exceed 500 characters")
		.trim(),
	topK: z
		.number({
			error: "topK must be a number",
		})
		.int("topK must be an integer")
		.min(1, "topK must be at least 1")
		.max(10, "topK cannot exceed 10")
		.optional()
		.default(3),
});

export const fileUploadSchema = z.object({
	mimeType: z.literal("application/pdf", {
		error: "Only PDF files are allowed",
	}),
	size: z
		.number()
		.max(config.uploads.maxFileSize, "File size exceeds the maximum limit"),
	originalName: z.string().min(1, "Original file name is required"),
});

export type QueryInput = z.infer<typeof querySchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
