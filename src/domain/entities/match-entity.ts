import mongoose, { Schema, Document } from "mongoose";

import { ITeam, Team } from "./team-entity";
import { IUser, User } from "./user-entity";

export enum MatchResult {
  WIN = "WIN",
  LOSS = "LOSS",
  DRAW = "DRAW",
}

export interface IMatchCreate {
  date: Date;
  localTeam: ITeam;
  visitorTeam: ITeam;
  goalsLocal?: IUser[];
  goalsVisitor?: IUser[];
  played: boolean;
  round: number;
  referee?: IUser;
}

export interface IMatch extends IMatchCreate, Document {}

const matchSchema = new Schema<IMatch>(
  {
    date: {
      type: Date,
      required: true,
    },

    localTeam: {
      type: Schema.Types.ObjectId,
      ref: Team,
      required: true,
    },

    visitorTeam: {
      type: Schema.Types.ObjectId,
      ref: Team,
      required: true,
    },

    goalsLocal: [
      {
        type: Schema.Types.ObjectId,
        ref: User,
      },
    ],

    goalsVisitor: [
      {
        type: Schema.Types.ObjectId,
        ref: User,
      },
    ],

    played: {
      type: Boolean,
      default: false,
    },

    round: {
      type: Number,
      min: [1, "Minimo primera jornada"],
    },

    referee: { type: Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
);

export const Match = mongoose.model<IMatch>("Match", matchSchema);
