import { Request, Response, NextFunction } from "express";
import { CustomError } from "./checkError.middleware";
import { userOdm } from "../domain/odm/user.odm";
import { verifyToken } from "../utils/token";

export const decodedUserToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new CustomError("Introduzca un token valido.", 400);
    }

    const decodedInfo = verifyToken(token);

    const user = await userOdm.getUserByEmail(decodedInfo.email);

    const userAuthInfo = { id: user.id as string, team: user.team as string, rol: user.rol };
    req.user = userAuthInfo;
    next();
  } catch (error) {
    next(error);
  }
};
