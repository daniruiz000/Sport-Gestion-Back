import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";

import { IUserCreate, ROL } from "../entities/user-entity";
import { userOdm } from "../odm/user.odm";
import { authDto } from "../dto/auth.dto";
import { UserAuthInfo } from "../../server/decodedUserToken.middleware";

import { generateToken } from "../../utils/token";
import { compareEncryptedDataWithData } from "../../utils/crypt";
import { userDto } from "../dto/user.dto";

export const getUsersPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const users = await userOdm.getAllUsersPaginated(page, limit);
    const totalElements = await userOdm.getUserCount();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: users,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyUserAllInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / EL PROPIO USUARIO A SÍ MISMO (CUALQUIER USUARIO LOGADO)
    const user = req.user as UserAuthInfo;
    const response = await userDto.getMyUserAllInfo(user);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPlayersWithoutTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN / MANAGER
    const userRol = req.user.rol;
    authDto.isUserRolAuthToAction(userRol, [ROL.ADMIN, ROL.MANAGER]);

    const playersWithoutTeam = await userOdm.getPlayersWithoutTeam();

    res.status(200).json(playersWithoutTeam);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN
    const userRol = req.user.rol;
    const id = req.params.id;

    authDto.isUserRolAuthToAction(userRol, [ROL.ADMIN]);

    const user = await userOdm.getUserById(id);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGADO
    const createdUser = await userOdm.createUser(req.body);

    res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / USUARIO A SÍ MISMO (CUALQUIER USUARIO LOGADO)/ MANAGER A JUGADORES DE SU EQUIPO
    const user = req.user as UserAuthInfo;
    const userToDeletedId = req.params.id;

    await authDto.isUserAuthToSpecialAction(user, userToDeletedId);

    const userDeleted = await userOdm.deleteUser(userToDeletedId);

    res.json(userDeleted);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / USUARIO A SÍ MISMO (CUALQUIER USUARIO LOGADO)/ MANAGER A JUGADORES DE SU EQUIPO
    const user = req.user as UserAuthInfo;
    const newDataToUser = req.body;
    const updateUserId = req.params.id;

    await authDto.isUserAuthToSpecialAction(user, updateUserId);

    const userToUpdate = await userOdm.getUserByIdWithPassword(updateUserId);

    const newFirstName = (user.id === updateUserId || user.rol === "ADMIN") && newDataToUser.firstName ? newDataToUser.firstName : userToUpdate.get("firstName");
    const newLastName = (user.id === updateUserId || user.rol === "ADMIN") && newDataToUser.lastName ? newDataToUser.lastName : userToUpdate.get("lastName");
    const newEmail = (user.id === updateUserId || user.rol === "ADMIN") && newDataToUser.email ? newDataToUser.email : userToUpdate.get("email");
    const newTeam = (req.user.rol === "MANAGER" && !userToUpdate.get("team")) || (req.user.rol === "MANAGER" && req.user.team?.toString() === userToUpdate.toObject().team?._id.toString()) || req.user.rol === "ADMIN" ? req.body.team : userToUpdate.get("team");
    const newImage = (user.id === updateUserId || user.rol === "ADMIN") && newDataToUser.image ? newDataToUser.image : userToUpdate.get("image");
    const newPassword = user.id === updateUserId && newDataToUser.password ? await bcrypt.hash(newDataToUser.password, 10) : userToUpdate.get("password");
    const newRol = req.user.rol === "ADMIN" ? newDataToUser.rol || userToUpdate.get("rol") : userToUpdate.get("rol");

    const userSended: IUserCreate = userToUpdate.toObject();

    userSended.firstName = newFirstName;
    userSended.lastName = newLastName;
    userSended.email = newEmail;
    userSended.team = newTeam;
    userSended.image = newImage;
    userSended.password = newPassword;
    userSended.rol = newRol;

    const userSaved = await userOdm.updateUser(updateUserId, userSended);

    res.json(userSaved);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // USUARIOS CREADOS se puede logar con su password y su email.
    const emailToCheck = req.body.email;
    const passwordToCheck = req.body.password;

    const user = await userOdm.getUserByEmailWithPassword(emailToCheck);

    await compareEncryptedDataWithData(passwordToCheck, user.password);

    const jwtToken = generateToken(user.id, user.email, user.rol);

    res.status(200).json({ token: jwtToken });
  } catch (error) {
    next(error);
  }
};

export const userService = {
  getMyUserAllInfo,
  getPlayersWithoutTeam,
  getUsersPaginated,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  login,
};
