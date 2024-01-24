import mongoose, { Schema, Document } from "mongoose";

import { ITeam, Team } from "./team-entity";
import { IUser, User } from "./user-entity";

export interface IMatchCreate {
  date: Date;
  localTeam: ITeam;
  visitorTeam: ITeam;
  goalsLocal?: IUser[];
  goalsVisitor?: IUser[];
  redCardLocal?: IUser[];
  redCardVisitor?: IUser[];
  yellowCardLocal?: IUser[];
  yellowCardVisitor?: IUser[];
  played: boolean;
  round: number;
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
    redCardLocal: [
      {
        type: Schema.Types.ObjectId,
        ref: User,
      },
    ],
    redCardVisitor: [
      {
        type: Schema.Types.ObjectId,
        ref: User,
      },
    ],
    yellowCardLocal: [
      {
        type: Schema.Types.ObjectId,
        ref: User,
      },
    ],
    yellowCardVisitor: [
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
  },
  { timestamps: true }
);

export const Match = mongoose.model<IMatch>("Match", matchSchema);
