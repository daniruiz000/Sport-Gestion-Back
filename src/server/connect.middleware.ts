import {
  Request,
  Response,
  NextFunction,
} from "express";

import { mongoConnect } from "../domain/repositories/mongo-repository"

export const connect = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
  await mongoConnect()
  next();
};
