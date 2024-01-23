/* eslint-disable @typescript-eslint/indent */
import { CustomError } from "../../server/checkError.middleware";
import { Match, IMatch, IMatchCreate } from "../entities/match-entity";
import { Document, ModifyResult } from "mongoose";

const getAllMatchsPaginated = async (page: number, limit: number): Promise<IMatch[]> => {
  const allMatchesPaginated = await Match.find()
    .limit(limit)
    .skip((page - 1) * limit)
    .populate(["localTeam", "visitorTeam"]);

  if (!allMatchesPaginated) {
    throw new CustomError("Partidos no encontrados", 400);
  }

  return allMatchesPaginated;
};

const getAllMatchs = async (): Promise<IMatch[]> => {
  const allMatchesPaginated = await Match.find().populate(["localTeam", "visitorTeam"]);

  if (!allMatchesPaginated) {
    throw new CustomError("Partidos no encontrados", 400);
  }

  return allMatchesPaginated;
};

const getMatchCount = async (): Promise<number> => {
  const matchCount = await Match.countDocuments();

  if (!matchCount) {
    throw new CustomError("Error al obtener el número de partidos.", 400);
  }

  return matchCount;
};

const getMatchById = async (id: string): Promise<IMatch> => {
  const match = await Match.findById(id).populate(["localTeam", "visitorTeam"]);

  if (!match) {
    throw new CustomError("Partido no encontrado.", 400);
  }

  return match;
};

const getMatchsByTeamId = async (teamId: string): Promise<IMatch[]> => {
  const match = await Match.find({
    $or: [{ localTeam: teamId }, { visitorTeam: teamId }],
  }).populate(["localTeam", "visitorTeam"]);

  if (!match) {
    throw new CustomError("Partido no encontrado.", 400);
  }

  return match;
};

const createMatch = async (matchData: IMatchCreate): Promise<IMatch> => {
  const savedMatch = await Match.create(matchData);

  if (!savedMatch) {
    throw new CustomError("Partido no encontrado.", 400);
  }

  return savedMatch;
};

const createMatchsFromArray = async (matchList: IMatchCreate[]): Promise<void> => {
  for (const match of matchList) {
    await matchOdm.createMatch(match);
  }
};

const deleteMatch = async (id: string): Promise<ModifyResult<IMatch>> => {
  const matchToDelete = await Match.findByIdAndDelete(id);

  if (!matchToDelete) {
    throw new CustomError("Problema al borrar el partido.", 204);
  }

  return matchToDelete;
};

const deleteAllMatch = async (): Promise<boolean> => {
  const isDeletedMatches = await Match.collection.drop();

  if (!isDeletedMatches) {
    throw new CustomError("Problema al borrar todos los partidos.", 204);
  }

  return isDeletedMatches;
};

const updateMatch = async (id: string, matchData: IMatchCreate): Promise<Document<IMatch> | null> => {
  const matchToUpdate = await Match.findByIdAndUpdate(id, matchData, { new: true, runValidators: true });

  if (!matchToUpdate) {
    throw new CustomError("Problema al actualizar el partido.", 400);
  }

  return matchToUpdate;
};

export const matchOdm = {
  getAllMatchs,
  getAllMatchsPaginated,
  getMatchCount,
  getMatchById,
  getMatchsByTeamId,
  createMatch,
  createMatchsFromArray,
  deleteMatch,
  deleteAllMatch,
  updateMatch,
};
