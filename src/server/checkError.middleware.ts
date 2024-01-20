import { type Request, type Response, type NextFunction } from "express";

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
        console.log("Error: Elemento ya registrado con alguno de estos datos.");
        res.status(409).json({ error: "Elemento ya registrado con alguno de estos datos." });
        return;

      default:
        console.log("Error interno del servidor");
        res.status(500).json({ error: "Error interno del servidor" });
        return;
    }
  }

  res.status(err.statusCode || 500).json({ error: err.message || "Error interno del servidor" });
};
