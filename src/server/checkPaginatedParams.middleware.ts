import { type Request, type Response, type NextFunction } from "express";
import { CustomError } from "./checkError.middleware";

export const checkPaginatedParams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query?.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query?.limit as string) : 10;

    if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
      req.query.page = page.toString();
      req.query.limit = limit.toString();
      next();
    } else {
      throw new CustomError("Parámetros no válidos", 400);
    }
  } catch (error) {
    next(error);
  }
};

export const checkLoginParamsIsCorrect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const email = req?.body?.email as string;
    const password = req?.body?.password as string;

    if (!email || !password) {
      throw new CustomError("Se deben especificar los campos email y password", 400);
    }

    next();
  } catch (error) {
    next(error);
  }
};
