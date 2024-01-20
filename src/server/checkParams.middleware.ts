import { type Request, type Response, type NextFunction } from "express";
import { CustomError } from "./checkError.middleware";

export const checkParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("Comprobamos los parámetros recibidos");

    const page = req.query.page ? parseInt(req.query?.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query?.limit as string) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page as any;
      req.query.limit = limit as any;
      next();
    } else {
      console.log("Parámetros no válidos:");
      console.log(JSON.stringify(req.query));
      throw new CustomError("Parámetros no válidos", 400);
    }
  } catch (error) {
    next(error);
  }
};
