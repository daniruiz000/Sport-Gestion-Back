/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - rol
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del usuario.
 *         firstName:
 *           type: string
 *           description: Nombre del usuario.
 *           minLength: 3
 *           maxLength: 22
 *         lastName:
 *           type: string
 *           description: Apellido del usuario.
 *           minLength: 3
 *           maxLength: 22
 *         email:
 *           type: string
 *           description: Email del usuario.
 *           format: email
 *         password:
 *           type: string
 *           description: Contraseña del usuario.
 *           minLength: 8
 *         rol:
 *           type: string
 *           description: Rol del usuario.
 *           enum:
 *             - PLAYER
 *             - MANAGER
 *             - ADMIN
 *         team:
 *           type: string
 *           description: ID del equipo al que pertenece el usuario.
 *         image:
 *           type: string
 *           description: URL de la imagen del usuario.
 *       example:
 *         _id: 60c84e71ebeb8f001ff60999
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         password: [hidden]
 *         rol: PLAYER
 *         team: 60c84e71ebeb8f001ff60998
 *         image: https://example.com/johndoe.png
 */

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

const userSchema = new Schema<IUserCreate>(
  {
    firstName: {
      type: String,
      trim: true,
      minLength: [3, "Al menos tres letras para el nombre"],
      maxLength: [22, "Nombre demasiado largo, máximo de 22 caracteres"],
      required: true
    },
    lastName: {
      type: String,
      trim: true,
      minLength: [3, "Al menos tres letras para el nombre"],
      maxLength: [22, "Nombre demasiado largo, máximo de 22 caracteres"],
      required: true
    },
    email: {
      type: String,
      trim: true,
      unique: true, // indica que no puede haber otra entidad con esta propiedad que tenga el mismo valor.
      validate: {
        validator: (text: string) => validator.isEmail(text),
        message: "Email incorrecto",
      },
      required: true
    },
    password: {
      type: String,
      trim: true,
      minLength: [8, "La contraseña debe tener al menos 8 caracteres"],
      select: false, // Indica que no lo deseamos mostrar cuando se realicen las peticiones.
      required: true
    },
    rol: {
      type: String,
      enum: ROL,
      default: ROL.PLAYER,
      required: true
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: Team,
      required: false
    },
    image: {
      type: String,
      trim: true,
      required: false
    },

  },
  { timestamps: true } // Cada vez que se modifique un documento refleja la hora y fecha de modificación
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
// Creamos tipos para usuarios
export type IUser = IUserCreate & Document
// Creamos un modelo para que siempre que creamos un user valide contra el Schema que hemos creado para ver si es valido.
export const User = mongoose.model<IUserCreate>("User", userSchema);
