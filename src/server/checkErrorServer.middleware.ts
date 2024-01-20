import {
  type Request,
  type Response,
  type ErrorRequestHandler,
  NextFunction,
} from "express";

export const checkErrorServer = async (err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("*** INICIO DE ERROR DEL SERVIDOR ***");
  console.log(`PETICIÓN FALLIDA: ${req.method} a la url ${req.originalUrl}`);
  console.log(err);
  console.log("*** FIN DE ERROR ***");
  res.status(500).json(err);
};
