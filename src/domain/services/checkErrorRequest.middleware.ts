import {
  type Request,
  type Response,
  type ErrorRequestHandler,
  type NextFunction,
} from "express";

export const checkErrorRequest = async (err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("*** INICIO DE ERROR ***");
  console.log(`PETICIÓN FALLIDA: ${req.method} a la url ${req.originalUrl}`);
  console.log(err);
  console.log("*** FIN DE ERROR ***");

  const errorAsAny: any = err as unknown as any

  if (err?.name === "ValidationError") {
    res.status(400).json(err);
  } else if (errorAsAny.errmsg && errorAsAny.errmsg?.indexOf("duplicate key") !== -1) {
    res.status(400).json({ error: errorAsAny.errmsg });
  } else if (errorAsAny?.code === "ER_NO_DEFAULT_FOR_FIELD") {
    res.status(400).json({ error: errorAsAny?.sqlMessage })
  } else {
    next(err)
  }
};
