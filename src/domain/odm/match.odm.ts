import { ModifyResult } from "mongoose";
import { Match, IMatch, IMatchCreate } from "../entities/match-entity";
import { CustomError } from "../../server/checkError.middleware";

const getAllMatches = async (): Promise<IMatch[]> => {
  const allMatches = await Match.find().populate(["localTeam", "visitorTeam"]);

  if (!allMatches) {
    throw new CustomError("Partidos no encontrados", 400);
  }

  return allMatches;
};

const getMatchById = async (id: string): Promise<IMatch> => {
  const matchById = await Match.findById(id).populate(["localTeam", "visitorTeam"]);

  if (!matchById) {
    throw new CustomError("Partido no encontrado.", 400);
  }

  return matchById;
};

const getMatchesByRound = async (round: string): Promise<IMatch[]> => {
  const allMatchesByRound = await Match.find({ round }).populate(["localTeam", "visitorTeam"]);

  if (!allMatchesByRound) {
    throw new CustomError("Partidos no encontrados", 400);
  }

  return allMatchesByRound;
};

const getMatchesByTeamId = async (teamId: string): Promise<IMatch[]> => {
  const matchesByTeamId = await Match.find({
    $or: [{ localTeam: teamId }, { visitorTeam: teamId }],
  }).populate(["localTeam", "visitorTeam"]);

  if (!matchesByTeamId) {
    throw new CustomError("Partido no encontrado.", 400);
  }

  return matchesByTeamId;
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

const updateMatch = async (id: string, matchData: IMatchCreate): Promise<IMatch> => {
  const matchToUpdate = await Match.findByIdAndUpdate(id, matchData, { new: true, runValidators: true });

  if (!matchToUpdate) {
    throw new CustomError("Problema al actualizar el partido.", 400);
  }

  return matchToUpdate;
};

export const matchOdm = {
  getAllMatches,
  getMatchById,
  getMatchesByRound,
  getMatchesByTeamId,
  createMatch,
  createMatchsFromArray,
  deleteMatch,
  deleteAllMatch,
  updateMatch,
};
