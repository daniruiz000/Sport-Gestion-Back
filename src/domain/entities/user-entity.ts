import mongoose, { Document } from "mongoose";

import validator from "validator";
import bcrypt from "bcrypt";
import { Team } from "./team-entity";

const Schema = mongoose.Schema;

export enum ROL {
  PLAYER = "PLAYER",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
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

// Cada vez que se guarde un usuario encriptamos la contraseña
userSchema.pre("save", async function (next) {
  try {
    // Si la password estaba encriptada, no la encriptaremos de nuevo.
    if (this.isModified("password")) {
      // Si el campo password se ha modificado
      const saltRounds = 10;
      const passwordEncrypted = await bcrypt.hash(this.password, saltRounds); // Encriptamos la contraseña
      this.password = passwordEncrypted; // guardamos la password en la entidad User
      next();
    }
  } catch (error) {
    next();
  }
});

export const User = mongoose.model<IUser>("User", userSchema);
