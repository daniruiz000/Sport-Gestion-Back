import { ModifyResult } from "mongodb";
import { Team, ITeam, ITeamCreate } from "../entities/team-entity";
import { CustomError } from "../../server/checkError.middleware";

const getAllTeams = async (): Promise<ITeam[]> => {
  const teams = await Team.find();

  if (!teams) {
    throw new CustomError("Equipos no encontrados.", 400);
  }

  return teams;
};

const getAllTeamsPaginated = async (page: number, limit: number): Promise<ITeam[]> => {
  const teams = await Team.find()
    .limit(limit)
    .skip((page - 1) * limit);

  if (!teams) {
    throw new CustomError("Equipos no encontrados.", 400);
  }

  return teams;
};

const getTeamCount = async (): Promise<number> => {
  const teamsCount = await Team.countDocuments();

  if (!teamsCount) {
    throw new CustomError("Equipos no encontrados.", 400);
  }

  return teamsCount;
};

const getTeamById = async (id: string): Promise<ITeam> => {
  const team = await Team.findById(id);

  if (!team) {
    throw new CustomError("Equipo no encontrado.", 400);
  }

  return team;
};

const getTeamByName = async (name: string): Promise<ITeam | ITeam[]> => {
  const team = await Team.find({ name: new RegExp("^" + name.toLowerCase(), "i") });

  if (!team) {
    throw new CustomError("Equipo no encontrado.", 400);
  }

  return team;
};

const createTeam = async (teamData: ITeamCreate): Promise<ITeam> => {
  const team = await Team.create(teamData);

  if (!team) {
    throw new CustomError("Equipo no creado.", 400);
  }

  return team;
};

const createTeamsFromArray = async (teamList: ITeamCreate[]): Promise<void> => {
  for (const team of teamList) {
    await teamOdm.createTeam(team);
  }
};

const deleteTeam = async (id: string): Promise<ModifyResult<ITeam>> => {
  const team = await Team.findByIdAndDelete(id);

  if (!team) {
    throw new CustomError("Equipo no borrado.", 400);
  }

  return team;
};

const deleteAllTeams = async (): Promise<boolean> => {
  return await Team.collection.drop();
};

const updateTeam = async (id: string, teamData: ITeamCreate): Promise<ITeam> => {
  const updateUser = await Team.findByIdAndUpdate(id, teamData, { new: true, runValidators: true });

  if (!updateUser) {
    throw new CustomError("Problema al actualizar el team.", 400);
  }

  return updateUser;
};

export const teamOdm = {
  getAllTeams,
  getAllTeamsPaginated,
  getTeamCount,
  getTeamById,
  getTeamByName,
  createTeam,
  createTeamsFromArray,
  deleteTeam,
  deleteAllTeams,
  updateTeam,
};
