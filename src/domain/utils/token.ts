//  Importamos jwt
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import { CustomError } from "../../server/checkError.middleware";

dotenv.config();

export const generateToken = (id: string, email: string, rol: string): string => {
  if (!id || !email) {
    throw new CustomError("Falta Email o usuario para generar el token.", 400);
  }

  const payload = {
    id,
    email,
    rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "1d" });
  return token;
};

export const verifyToken = (token: string): any => {
  if (!token) {
    throw new Error("Token is missing");
  }
  const result = jwt.verify(token, process.env.JWT_SECRET as string);
  return result;
};
