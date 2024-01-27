import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { CustomError } from "../server/checkError.middleware";

import { ROL } from "../domain/entities/user-entity";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateToken = (id: string, email: string, rol: ROL): string => {
  const payload = {
    id,
    email,
    rol,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  if (!token) {
    throw new CustomError("Error al generar el token.", 400);
  }
  return token;
};

export const verifyToken = (token: string): any => {
  const result = jwt.verify(token, JWT_SECRET);
  if (!result) {
    throw new CustomError("Error al verificar el token.", 400);
  }
  return result;
};
