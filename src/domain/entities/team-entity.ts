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
