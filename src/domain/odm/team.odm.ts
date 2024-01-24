/* eslint-disable @typescript-eslint/indent */
import { ModifyResult } from "mongodb";
import { Team, ITeam, ITeamCreate } from "../entities/team-entity";
import { Document } from "mongoose";

const getAllTeams = async (): Promise<ITeam[]> => {
  return await Team.find();
};

const getAllTeamsPaginated = async (page: number, limit: number): Promise<ITeam[]> => {
  return await Team.find()
    .limit(limit)
    .skip((page - 1) * limit);
};

const getTeamCount = async (): Promise<number> => {
  return await Team.countDocuments();
};

const getTeamById = async (id: string): Promise<Document<ITeam> | null> => {
  return await Team.findById(id);
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
    await teamOdm.createTeam(team);
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

export const teamOdm = {
  getAllTeams,
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
