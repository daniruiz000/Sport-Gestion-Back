import { ModifyResult } from "mongodb";
import { Document } from "mongoose";
import { CustomError } from "../../server/checkError.middleware";

import { User, IUser, IUserCreate, ROL } from "../entities/user-entity";
import { userOdm } from "../odm/user.odm";
import { teamDto } from "./team.dto";

const isUserAuthForAction = (userRol: string, authRoles: ROL[]): void => {
  let isAuth = false;

  for (const authRol of authRoles) {
    if (authRol === userRol) {
      isAuth = true;
    }
  }

  if (!isAuth) {
    throw new CustomError("No estás autorizado para realizar la operación.", 409);
  }
};

const getAllUsersPaginated = async (page: number, limit: number): Promise<IUser[]> => {
  try {
    return await userOdm.getAllUsersPaginated(page, limit);
  } catch (error) {
    throw new CustomError("Error al obtener los usuarios.", 400);
  }
};

const getUserCount = async (): Promise<number> => {
  try {
    return await userOdm.getUserCount();
  } catch (error) {
    throw new CustomError("Error al obtener el número de usuarios.", 400);
  }
};

const getUserById = async (id: string): Promise<Document<IUser> | null> => {
  try {
    const userSaved = await userOdm.getUserById(id);
    return userSaved;
  } catch (error) {
    throw new CustomError("Error al obtener el usuario.", 400);
  }
};

const getPlayersByIdTeam = async (teamId: string): Promise<IUser[]> => {
  try {
    const players: IUser[] | null = await userOdm.getPlayersByIdTeam(teamId);
    return players;
  } catch (error) {
    throw new CustomError("Error al obtener los usuarios del equipo.", 400);
  }
};

const getPlayersWithoutTeam = async (): Promise<IUser[]> => {
  try {
    const players: IUser[] | null = await userOdm.getPlayersWithoutTeam();
    if (!players.length) {
      throw new CustomError("No existen jugadores sin equipo", 201);
    }
    return players;
  } catch (error) {
    throw new CustomError("Error al obtener los usuarios sin equipo.", 400);
  }
};

const getManagerByIdTeam = async (teamId: string): Promise<IUser[]> => {
  try {
    const players = await userOdm.getManagerByIdTeam(teamId);
    return players;
  } catch (error) {
    throw new CustomError("Error al obtener el manager del equipo.", 400);
  }
};

const getUserByEmailWithPassword = async (emailPassed: string): Promise<Document<IUser> | null> => {
  try {
    const user = await userOdm.getUserByEmailWithPassword(emailPassed);
    return user;
  } catch (error) {
    throw new CustomError("Error al obtener el usuario.", 400);
  }
};

const createUser = async (userData: IUserCreate): Promise<Document<IUser>> => {
  try {
    const newUser = new User(userData);
    const document = await userOdm.createUser(newUser);
    const userCopy = document.toObject();
    delete userCopy.password;
    delete userCopy.rol;
    return userCopy;
  } catch (error) {
    throw new CustomError("Error al crear el usuario.", 400);
  }
};

const createUsersFromArray = async (userList: IUserCreate[]): Promise<void> => {
  for (const element of userList) {
    const user = element;
    await userOdm.createUser(user);
  }
};

const deleteUser = async (id: string): Promise<ModifyResult<Document<IUserCreate>> | null> => {
  try {
    return await userOdm.deleteUser(id);
  } catch (error) {
    throw new CustomError("Error al borrar el usuario.", 400);
  }
};

const deleteAllUsers = async (): Promise<boolean> => {
  try {
    return await userOdm.deleteAllUsers();
  } catch (error) {
    throw new CustomError("Error al borrar la colección de usuarios.", 400);
  }
};

const updateUser = async (id: string, userData: IUserCreate): Promise<Document<IUser> | null> => {
  try {
    return await userOdm.updateUser(id, userData);
  } catch (error) {
    throw new CustomError("Error al actualizar el usuario.", 400);
  }
};

const updateRoleUser = async (userId: string, newRole: ROL): Promise<Document<IUser> | null> => {
  try {
    return await userOdm.updateRoleUser(userId, newRole);
  } catch (error) {
    throw new CustomError("Error al actualizar el rol del usuario.", 400);
  }
};

const assignTeamToUser = async (userId: string, teamId: string): Promise<Document<IUser> | null> => {
  try {
    const teamSaved = await teamDto.getTeamById(teamId);
    const userSaved = await userDto.getUserById(userId);
    if (!teamSaved || !userSaved) {
      throw new CustomError("Error al actualizar el rol del usuario.", 400);
    }
    const userCopy = userSaved.toObject();
    userCopy.team = teamId;
    return await userDto.updateUser(userId, userCopy);
  } catch (error) {
    throw new CustomError("Error al asignar el usuario al equipo.", 400);
  }
};

const removeTeamFromUser = async (userId: string): Promise<Document<IUser> | null> => {
  try {
    return await userOdm.removeTeamFromUser(userId);
  } catch (error) {
    throw new CustomError("Error al borrar al usuario del equipo.", 400);
  }
};

export const userDto = {
  isUserAuthForAction,
  getAllUsersPaginated,
  getUserCount,
  getUserById,
  getPlayersByIdTeam,
  getPlayersWithoutTeam,
  getManagerByIdTeam,
  getUserByEmailWithPassword,
  createUser,
  createUsersFromArray,
  deleteUser,
  deleteAllUsers,
  updateUser,
  updateRoleUser,
  assignTeamToUser,
  removeTeamFromUser,
};
