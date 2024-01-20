/**
 * @swagger
 * components:
 *   schemas:
 *     TeamCreate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Nombre del equipo.
 *           minLength: 5
 *           maxLength: 30
 *         initials:
 *           type: string
 *           description: Iniciales del equipo.
 *           minLength: 3
 *           maxLength: 3
 *         image:
 *           type: string
 *           description: URL de la imagen del equipo.
 *       example:
 *         name: Equipo A
 *         initials: EQA
 *         image: https://example.com/teamA.png
 *     Team:
 *       allOf:
 *         - $ref: '#/components/schemas/TeamCreate'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: ID del equipo.
 *           example:
 *             _id: 60c84e71ebeb8f001ff60999
 *             name: Equipo A
 *             initials: EQA
 *             image: https://example.com/teamA.png
 */

import { Schema, model, Document } from "mongoose";

export interface ITeamCreate {
  name: string;
  initials: string;
  image?: string;
}

export interface ITeamsStatistics {
  id: string;
  name: string;
  initials: string;
  image?: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  position: number;
}

export interface ITeam extends ITeamCreate, Document {}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      minLength: [5, "El nombre debe tener al menos cinco letras"],
      maxLength: [30, "El nombre debe tener como máximo 30 caracteres"],
      required: true,
    },
    initials: {
      type: String,
      trim: true,
      minLength: [3, "Las iniciales deben estar compuestas por tres letras"],
      maxLength: [3, "Las iniciales deben estar compuestas por tres letras"],
      unique: true,
      required: true,
    },
    image: {
      type: String,
      required: false,
      maxLength: [255, "La URL de la imagen no debe exceder los 255 caracteres"],
    },
  },
  { timestamps: true }
);

export const Team = model<ITeam>("Team", teamSchema);
