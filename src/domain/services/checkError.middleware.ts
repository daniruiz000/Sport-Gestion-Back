import { type Request, type Response, type ErrorRequestHandler, type NextFunction } from "express";

export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const checkError = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  if ("code" in err) {
    const errorCode = err.code;
    switch (errorCode) {
      case 11000:
        res.status(409).json({ error: "Elemento ya registrado con alguno de estos datos." });
        return;

      default:
        res.status(500).json({ error: "Error interno del servidor" });
        return;
    }
  }

  res.status(err.statusCode || 500).json({ error: err.message || "Error interno del servidor" });
};
