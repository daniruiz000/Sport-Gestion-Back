/* eslint-disable @typescript-eslint/indent */
import { ModifyResult } from "mongodb";
import { ITeamCreate, Team } from "../entities/team-entity";
import { User, IUser, IUserCreate, ROL } from "../entities/user-entity";
import { Document } from "mongoose";

const getAllUsers = async (page: number, limit: number): Promise<IUser[]> => {
  return await User.find()
    .populate("team")
    .limit(limit)
    .skip((page - 1) * limit);
};

const getUserCount = async (): Promise<number> => {
  return await User.countDocuments();
};

const getUserById = async (id: string): Promise<Document<IUser> | null> => {
  return await User.findById(id).populate("team");
};

const getPlayersByIdTeam = async (teamId: string): Promise<IUser[]> => {
  const players: IUser[] | null = await User.find({ team: teamId, rol: ROL.PLAYER }).populate("team");
  return players;
};

const getPlayersWithoutTeam = async (): Promise<IUser[]> => {
  const players: IUser[] | null = await User.find({ team: { $in: [null, undefined] }, rol: { $in: [ROL.PLAYER, ROL.MANAGER] } }).populate("team");
  console.log(players);
  return players;
};

const getManagerByIdTeam = async (teamId: string): Promise<IUser[]> => {
  const players: IUser[] | null = await User.find({ team: teamId, rol: ROL.MANAGER }).populate("team");
  return players;
};

const getUserByEmailWithPassword = async (emailPassed: string): Promise<Document<IUser> | null> => {
  const user: Document<IUser> | null = (await User.findOne({ email: emailPassed }).select("+password")) as any;
  return user;
};

const createUser = async (userData: IUserCreate): Promise<Document<IUser>> => {
  const user = new User(userData);
  const document: Document<IUser> = (await user.save()) as any;
  const userCopy = document.toObject();
  delete userCopy.password;
  delete userCopy.rol;
  return userCopy;
};

const createUsersFromArray = async (userList: IUserCreate[]): Promise<void> => {
  for (const element of userList) {
    const user = element;
    await userOdm.createUser(user);
  }
};

const deleteUser = async (id: string): Promise<ModifyResult<Document<IUserCreate>> | null> => {
  return await User.findByIdAndDelete(id);
};

const deleteAllUsers = async (): Promise<boolean> => {
  return await User.collection.drop();
};

const updateUser = async (id: string, userData: IUserCreate): Promise<Document<IUser> | null> => {
  return await User.findByIdAndUpdate(id, userData, { new: true, runValidators: true });
};

const updateRoleUser = async (userId: string, newRole: ROL): Promise<Document<IUser> | null> => {
  return await User.findByIdAndUpdate(userId, { rol: newRole }, { new: true, runValidators: true });
};

const assignTeamToUser = async (userId: string, teamId: string): Promise<Document<IUser> | null> => {
  const team: ITeamCreate | null = await Team.findById(teamId);
  if (!team) {
    throw new Error("Equipo no encontrado");
  }

  return await User.findByIdAndUpdate(userId, { team: teamId }, { new: true });
};

const removeTeamFromUser = async (userId: string): Promise<Document<IUser> | null> => {
  return await User.findByIdAndUpdate(userId, { team: null }, { new: true });
};

export const userOdm = {
  getAllUsers,
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
