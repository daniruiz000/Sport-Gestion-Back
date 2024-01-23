import bcrypt from "bcrypt";
import { AllUsersPaginated, IUser, MyUser, ROL, UserAuthInfo } from "../entities/user-entity";
import { userOdm } from "../odm/user.odm";
import { matchOdm } from "../odm/match.odm";
import { authDto } from "./auth.dto";

const getMyUserAllInfo = async (userAuthInfo: UserAuthInfo): Promise<MyUser> => {
  const iAmManager = userAuthInfo.rol === ROL.MANAGER;
  const iAmAdmin = userAuthInfo.rol === ROL.ADMIN;

  const myUser = await userOdm.getUserById(userAuthInfo.id);
  const playersOnMyTeam = await userOdm.getPlayersByIdTeam(userAuthInfo.team);
  const matchsOnMyTeam = await matchOdm.getMatchesByTeamId(userAuthInfo.team);
  const manager = iAmManager ? userAuthInfo.id : await userOdm.getManagerByIdTeam(userAuthInfo.team);

  const response = {
    myUser,
    playersOnMyTeam: iAmAdmin ? null : playersOnMyTeam,
    matchsOnMyTeam: iAmAdmin ? null : matchsOnMyTeam,
    manager: iAmAdmin ? null : manager,
  };

  return response;
};

const getAllUsersPaginated = async (page: number, limit: number): Promise<AllUsersPaginated> => {
  const users = await userOdm.getAllUsersPaginated(page, limit);
  const totalItems = await userOdm.getUserCount();

  const response = {
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
    users,
  };

  return response;
};

const updateUser = async (userAuthInfo: UserAuthInfo, newDataToUser: any, userToUpdateId: string): Promise<IUser> => {
  const iAmAdmin = userAuthInfo.rol === ROL.ADMIN;
  const iAmManager = userAuthInfo.rol === ROL.MANAGER;
  const itsMySelf = authDto.itsMySelf(userAuthInfo.id, userToUpdateId);
  const iAmManagerAndPlayerIdIsOnMyTeam = await authDto.iAmManagerAndPlayerIdIsOnMyTeam(userAuthInfo.rol, userAuthInfo.team, userToUpdateId);

  const userToUpdate = await userOdm.getUserByIdWithPassword(userToUpdateId);

  const newFirstName = (itsMySelf || iAmAdmin) && newDataToUser.firstName ? newDataToUser.firstName : userToUpdate.get("firstName");
  const newLastName = (itsMySelf || iAmAdmin) && newDataToUser.lastName ? newDataToUser.lastName : userToUpdate.get("lastName");
  const newEmail = (itsMySelf || iAmAdmin) && newDataToUser.email ? newDataToUser.email : userToUpdate.get("email");
  const newPassword = (itsMySelf || iAmAdmin) && newDataToUser.password ? await bcrypt.hash(newDataToUser.password, 10) : userToUpdate.get("password");
  const newTeam = (iAmManager && !userToUpdate.get("team")) || iAmAdmin || iAmManagerAndPlayerIdIsOnMyTeam ? newDataToUser.team : userToUpdate.get("team");
  const newImage = (itsMySelf || iAmAdmin || iAmManagerAndPlayerIdIsOnMyTeam) && newDataToUser.image ? newDataToUser.image : userToUpdate.get("image");
  const newRol = iAmAdmin && newDataToUser.rol ? newDataToUser.rol : userToUpdate.get("rol");

  const userSended = userToUpdate.toObject();

  userSended.firstName = newFirstName;
  userSended.lastName = newLastName;
  userSended.email = newEmail;
  userSended.password = newPassword;
  userSended.team = newTeam;
  userSended.image = newImage;
  userSended.rol = newRol;

  const userSaved = await userOdm.updateUser(userToUpdateId, userSended);

  return userSaved;
};

export const userDto = {
  getMyUserAllInfo,
  getAllUsersPaginated,
  updateUser,
};
