import mongoose, { Document } from "mongoose";
import validator from "validator";

import { Team } from "./team-entity";
import { encryptData } from "../../utils/crypt";
import { CustomError } from "../../server/checkError.middleware";
import { IMatch } from "./match-entity";

const Schema = mongoose.Schema;

export enum ROL {
  PLAYER = "PLAYER",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export interface MyUser {
  myUser: IUser;
  playersOnMyTeam: IUser[] | null;
  matchsOnMyTeam: IMatch[] | null;
  manager: string | IUser[] | null;
}

export interface IUserCreate {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rol: ROL;
  team?: string;
  image?: string;
}

export interface IUser extends IUserCreate, Document {}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      trim: true,
      minLength: [3, "Al menos tres letras para el nombre"],
      maxLength: [22, "Nombre demasiado largo, máximo de 22 caracteres"],
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      minLength: [3, "Al menos tres letras para el nombre"],
      maxLength: [22, "Nombre demasiado largo, máximo de 22 caracteres"],
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      validate: {
        validator: (text: string) => validator.isEmail(text),
        message: "Email incorrecto",
      },
      required: true,
    },
    password: {
      type: String,
      trim: true,
      minLength: [8, "La contraseña debe tener al menos 8 caracteres"],
      select: false,
      required: true,
    },
    rol: {
      type: String,
      enum: ROL,
      default: ROL.PLAYER,
      required: true,
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: Team,
      required: false,
    },
    image: {
      type: String,
      trim: true,
      required: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    const passwordEncrypted = await encryptData(this.password);
    if (!passwordEncrypted) {
      throw new CustomError("Fallo al encriptar la contraseña.", 400);
    }

    this.password = passwordEncrypted;
    next();
  } catch (error) {
    next();
  }
});

export const User = mongoose.model<IUser>("User", userSchema);
