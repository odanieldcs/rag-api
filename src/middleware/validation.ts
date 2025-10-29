import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "./errorHandler.js";

export function validateSchema<T extends z.ZodTypeAny>(schema: T) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const validated = schema.parse(req.body);
			req.body = validated;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				const messages = error.errors.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				}));
				throw new AppError(400, "Erro de validação", true, messages);
			}
			next(error);
		}
	};
}

export function validateFile(req: Request, res: Response, next: NextFunction) {
	try {
		if (!req.file) {
			throw new AppError(400, "Nenhum arquivo enviado");
		}
		const { fileUploadSchema } = require("../schemas/index.js");

		fileUploadSchema.parse({
			mimeType: req.file.mimetype,
			size: req.file.size,
			originalName: req.file.originalname,
		});

		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			const message = error.errors[0]?.message || "Arquivo inválido";
			throw new AppError(400, message);
		}
		next(error);
	}
}
