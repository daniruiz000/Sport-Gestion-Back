import { Request, Response, NextFunction } from "express";

import { mongoConnect, mongoDisconnect } from "../domain/repositories/mongo-repository";

export const connect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await mongoConnect();
  next();
};

export const disconnect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  await mongoDisconnect();
  next();
};
