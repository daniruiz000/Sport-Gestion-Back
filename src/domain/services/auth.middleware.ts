import { CustomError } from "../../server/checkError.middleware";
import { User } from "../entities/user-entity";
import { verifyToken } from "../utils/token";

import { Request, Response, NextFunction } from "express";

export const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new CustomError("No tienes token", 400);
    }

    const decodedInfo = verifyToken(token);

    const user = await User.findOne({ email: decodedInfo.email }).select("+password");
    if (!user) {
      throw new CustomError("No existe usuario con ese email.", 400);
    }

    req.user = { id: user.id, team: user.team, rol: user.rol };
    next();
  } catch (error) {
    next(error);
  }
};
