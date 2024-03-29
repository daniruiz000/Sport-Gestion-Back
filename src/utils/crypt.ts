import bcrypt from "bcrypt";
import dotenv from "dotenv";

import { CustomError } from "../server/checkError.middleware";

dotenv.config();

const saltRounds = process.env.SALT_ROUNDS as string;

export const encryptData = async (data: string): Promise<string> => {
  const rounds = parseInt(saltRounds);
  const dataEncrypted = await bcrypt.hash(data, rounds);
  if (!dataEncrypted) {
    throw new CustomError("Error al encriptar los datos.", 401);
  }
  return dataEncrypted;
};

export const compareEncryptedDataWithData = async (data: string, encrypted: string): Promise<void> => {
  const match = await bcrypt.compare(data, encrypted);
  if (!match) {
    throw new CustomError("Contraseña incorrecta.", 401);
  }
};
