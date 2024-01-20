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
    if (errorCode === 11000) {
      console.log("Error: Elemento ya registrado con alguno de estos datos.");
      res.status(409).json({ error: "Elemento ya registrado con alguno de estos datos." });
      return;
    } else {
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    }
  }

  const errorName = err.name;
  const errorMessage = err.message;

  if (errorName === "JsonWebTokenError") {
    console.log("Error: Token no valido.");
    if (errorMessage === "invalid token") {
      res.status(401).json({ error: "Token no valido." });
      return;
    }
  }

  if (errorName === "CastError") {
    res.status(400).json({ error: err.message });
    return;
  }

  if (errorName === "ValidationError") {
    res.status(401).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message || "Error interno del servidor" });
};
