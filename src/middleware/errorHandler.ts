import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
	constructor(
		public statusCode: number,
		public message: string,
		public isOperational: boolean = true,
		public details?: any,
	) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export function errorHandler(
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			success: false,
			message: err.message,
			...(err.details && { details: err.details }), // inclui detalhes se existirem
		});
	}

	console.error("Erro inesperado:", err);

	return res.status(500).json({
		success: false,
		message: "Internal Server Error",
	});
}
