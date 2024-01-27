import { Request, Response, NextFunction } from "express";

import { ROL, UserAuthInfo } from "../entities/user-entity";

import { userOdm } from "../odm/user.odm";
import { authDto } from "../dto/auth.dto";
import { userDto } from "../dto/user.dto";

import { generateToken } from "../../utils/token";
import { compareEncryptedDataWithData } from "../../utils/crypt";

export const getUsersPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const response = await userDto.getAllUsersPaginated(page, limit);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyUserAllInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / EL PROPIO USUARIO A SÍ MISMO (CUALQUIER USUARIO LOGADO)
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN, ROL.MANAGER, ROL.PLAYER]);

    const response = await userDto.getMyUserAllInfo(userAuthInfo);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPlayersWithoutTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN / MANAGER
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN, ROL.MANAGER]);

    const playersWithoutTeam = await userOdm.getPlayersWithoutTeam();

    res.status(200).json(playersWithoutTeam);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN
    const id = req.params.id;
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

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
    const userToDeletedId = req.params.id;
    const userAuthInfo = req.user as UserAuthInfo;

    await authDto.isUserAuthToSpecialAction(userAuthInfo, userToDeletedId);

    const userDeleted = await userOdm.deleteUser(userToDeletedId);

    res.status(202).json(userDeleted);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / USUARIO A SÍ MISMO (CUALQUIER USUARIO LOGADO)/ MANAGER A JUGADORES DE SU EQUIPO
    const newDataToUser = req.body;
    const userToUpdateId = req.params.id;
    const userAuthInfo = req.user as UserAuthInfo;

    await authDto.isUserAuthToSpecialAction(userAuthInfo, userToUpdateId);

    const userSaved = await userDto.updateUser(userAuthInfo, newDataToUser, userToUpdateId);

    res.status(200).json(userSaved);
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
