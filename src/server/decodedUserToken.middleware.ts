import { CustomError } from "./checkError.middleware";
import { userOdm } from "../domain/odm/user.odm";
import { verifyToken } from "../utils/token";

import { Request, Response, NextFunction } from "express";
import { ROL } from "../domain/entities/user-entity";

export interface UserAuthInfo {
  id: string;
  team: string;
  rol: ROL;
}

export const decodedUserToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new CustomError("Introduzca un token valido.", 400);
    }

    const decodedInfo = verifyToken(token);

    const user = await userOdm.getUserByEmail(decodedInfo.email);

    const userAuthInfo = { id: user?.id, team: user?.team, rol: user?.rol };
    req.user = userAuthInfo;
    next();
  } catch (error) {
    next(error);
  }
};
