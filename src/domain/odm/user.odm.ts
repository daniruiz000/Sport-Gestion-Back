import { ModifyResult } from "mongodb";
import { User, IUser, IUserCreate, ROL } from "../entities/user-entity";
import { Document } from "mongoose";
import { CustomError } from "../../server/checkError.middleware";

const getAllUsersPaginated = async (page: number, limit: number): Promise<IUser[]> => {
  const userListPaginated = await User.find()
    .populate("team")
    .limit(limit)
    .skip((page - 1) * limit);

  if (!userListPaginated) {
    throw new CustomError("Usuarios no encontrados.", 400);
  }

  return userListPaginated;
};

const getUserCount = async (): Promise<number> => {
  const userCount = await User.countDocuments();
  if (!userCount) {
    throw new CustomError("Error al obtener el número de usuarios.", 400);
  }

  return userCount;
};

const getUserById = async (id: string): Promise<IUser> => {
  const user = await User.findById(id).populate("team");
  if (!user) {
    throw new CustomError("Usuario no encontrado.", 400);
  }

  return user;
};

const getUserByIdWithPassword = async (id: string): Promise<IUser> => {
  const user = await User.findById(id).populate("team").select("+password");
  if (!user) {
    throw new CustomError("Usuario no encontrado.", 400);
  }

  return user;
};

const getUserByEmail = async (emailPassed: string): Promise<IUser> => {
  const user = await User.findOne({ email: emailPassed });
  if (!user) {
    throw new CustomError("Usuario no encontrado.", 400);
  }

  return user;
};

const getUserByEmailWithPassword = async (emailPassed: string): Promise<IUser> => {
  const user = await User.findOne({ email: emailPassed }).select("+password");
  if (!user) {
    throw new CustomError("Usuario no encontrado.", 400);
  }

  return user;
};

const getPlayersByIdTeam = async (teamId: string): Promise<IUser[]> => {
  const players = await User.find({ team: teamId, rol: ROL.PLAYER });
  if (!players) {
    throw new CustomError("Problema al buscar usuarios para ese equipo.", 400);
  }

  return players;
};

const getPlayersWithoutTeam = async (): Promise<IUser[]> => {
  const players = await User.find({ team: { $in: [null, undefined] }, rol: { $in: [ROL.PLAYER, ROL.MANAGER] } });
  if (!players) {
    throw new CustomError("Problema al buscar usuarios sin equipo.", 400);
  }

  return players;
};

const getManagerByIdTeam = async (teamId: string): Promise<IUser[]> => {
  const manager = await User.find({ team: teamId, rol: ROL.MANAGER });
  if (!manager) {
    throw new CustomError("Problema al buscar el manager de ese equipo.", 400);
  }

  return manager;
};

const getManagerWithoutTeam = async (): Promise<IUser[]> => {
  const manager = await User.find({ team: { $in: [null, undefined] }, rol: ROL.MANAGER });
  if (!manager) {
    throw new CustomError("Problema al buscar el manager de ese equipo.", 400);
  }

  return manager;
};

const createUser = async (userData: IUserCreate): Promise<IUser> => {
  const user = new User(userData);
  const userSaved = await user.save();
  if (!userSaved) {
    throw new CustomError("Problema al registrar el usuario.", 400);
  }

  return userSaved;
};

const createUsersFromArray = async (userList: IUserCreate[]): Promise<void> => {
  for (const user of userList) {
    await userOdm.createUser(user);
  }
};

const deleteUser = async (id: string): Promise<ModifyResult<Document<IUser>>> => {
  const userDeleted = await User.findByIdAndDelete(id);
  if (!userDeleted) {
    throw new CustomError("Problema al borrar el usuario.", 400);
  }

  return userDeleted;
};

const deleteAllUsers = async (): Promise<boolean> => {
  const isDeletedUsers = await User.collection.drop();
  if (!isDeletedUsers) {
    throw new CustomError("Problema al borrar todos los usuarios.", 400);
  }

  return isDeletedUsers;
};

const updateUser = async (id: string, userData: IUserCreate): Promise<IUser> => {
  const updateUser = await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true }).select("+password");
  if (!updateUser) {
    throw new CustomError("Problema al borrar el usuario.", 400);
  }

  return updateUser;
};

export const userOdm = {
  getAllUsersPaginated,
  getUserCount,
  getUserById,
  getUserByIdWithPassword,
  getPlayersByIdTeam,
  getPlayersWithoutTeam,
  getManagerByIdTeam,
  getManagerWithoutTeam,
  getUserByEmailWithPassword,
  getUserByEmail,
  createUser,
  createUsersFromArray,
  deleteUser,
  deleteAllUsers,
  updateUser,
};
