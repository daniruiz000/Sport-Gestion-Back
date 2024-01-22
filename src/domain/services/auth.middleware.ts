import { CustomError } from "../../server/checkError.middleware";
import { userOdm } from "../odm/user.odm";
import { verifyToken } from "../utils/token";

import { Request, Response, NextFunction } from "express";

export const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new CustomError("No tienes token", 400);
    }

    const decodedInfo = verifyToken(token);

    const user = await userOdm.getUserByEmail(decodedInfo.email);

    const userAuthInfo = { id: user.id, team: user.team, rol: user.rol };
    req.user = userAuthInfo;
    next();
  } catch (error) {
    next(error);
  }
};
