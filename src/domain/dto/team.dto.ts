/* eslint-disable @typescript-eslint/indent */
import { ModifyResult } from "mongodb";
import { Team, ITeam, ITeamCreate } from "../entities/team-entity";
import { Document } from "mongoose";
import { CustomError } from "../../server/checkError.middleware";
import { teamOdm } from "../odm/team.odm";

const getAllTeamsPaginated = async (page: number, limit: number): Promise<ITeam[]> => {
  try {
    return await teamOdm.getAllTeamsPaginated(page, limit);
  } catch (error) {
    throw new CustomError("Error al obtener el equipo.", 400);
  }
};

const getTeamCount = async (): Promise<number> => {
  return await Team.countDocuments();
};

const getTeamById = async (id: string): Promise<Document<ITeam> | null> => {
  try {
    return await teamDto.getTeamById(id);
  } catch (error) {
    throw new CustomError("Error al obtener el equipo.", 400);
  }
};

const getMyTeam = async (page: number, limit: number): Promise<ITeam[]> => {
  return await Team.find();
};

const getTeamByName = async (name: string): Promise<Document<ITeam>[]> => {
  return await Team.find({ name: new RegExp("^" + name.toLowerCase(), "i") });
};

const createTeam = async (teamData: ITeamCreate): Promise<Document<ITeam>> => {
  const team = new Team(teamData);
  const document: Document<ITeam> = (await team.save()) as any;

  return document;
};

const createTeamsFromArray = async (teamList: ITeamCreate[]): Promise<void> => {
  for (const team of teamList) {
    await teamDto.createTeam(team);
  }
};

const deleteTeam = async (id: string): Promise<ModifyResult<Document<ITeam>> | null> => {
  return await Team.findByIdAndDelete(id);
};

const deleteAllTeams = async (): Promise<boolean> => {
  return await Team.collection.drop();
};

const updateTeam = async (id: string, teamData: ITeamCreate): Promise<Document<ITeam> | null> => {
  return await Team.findByIdAndUpdate(id, teamData, { new: true, runValidators: true });
};

export const teamDto = {
  getAllTeamsPaginated,
  getTeamCount,
  getTeamById,
  getMyTeam,
  getTeamByName,
  createTeam,
  createTeamsFromArray,
  deleteTeam,
  deleteAllTeams,
  updateTeam,
};
