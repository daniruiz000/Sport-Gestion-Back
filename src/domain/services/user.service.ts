import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";

import { IUserCreate, ROL } from "../entities/user-entity";
import { userOdm } from "../odm/user.odm";
import { userDto } from "../dto/user.dto";
import { matchOdm } from "../odm/match.odm";

import { generateToken } from "../../utils/token";
import { compareEncryptedDataWithData } from "../../utils/crypt";

export const getUsersPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const userAuthInfo = req.user;

    userDto.isUserRolAuthForAction(userAuthInfo, [ROL.ADMIN]);

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
    const userId = req.user.id as string;
    const userTeam = req.user.team as string;

    const user = await userOdm.getUserById(userId);
    const playersOnMyTeam = await userOdm.getPlayersByIdTeam(userTeam);
    const matchsOnMyTeam = await matchOdm.getMatchsByTeamId(userTeam);
    const manager = req.user.rol === ROL.MANAGER ? userId : await userOdm.getManagerByIdTeam(userTeam);

    const response = {
      user,
      playersOnMyTeam: req.user.rol === ROL.ADMIN ? null : playersOnMyTeam,
      matchsOnMyTeam: req.user.rol === ROL.ADMIN ? null : matchsOnMyTeam,
      manager: req.user.rol === ROL.ADMIN ? null : manager,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getPlayersWithoutTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN / MANAGER
    const userRol = req.user.rol;
    userDto.isUserRolAuthForAction(userRol, [ROL.ADMIN, ROL.MANAGER]);

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
    userDto.isUserRolAuthForAction(userRol, [ROL.ADMIN]);

    const id = req.params.id;
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
    // ADMIN / EL PROPIO USUARIO A SÍ MISMO (CUALQUIER USUARIO LOGADO)/ MANAGER A JUGADORES DE SU EQUIPO
    const userId = req.user.id;
    const userRol = req.user.rol;
    const userToDeletedId = req.params.id;

    userDto.isUserRolAuthForAction(userRol, [ROL.ADMIN, ROL.MANAGER, ROL.PLAYER]);

    if (userId !== userToDeletedId) {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const userDeleted = await userOdm.deleteUser(userToDeletedId);

    res.json(userDeleted);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Solo ADMIN o el propio usuario a sí mismo (cualquier usuario logado) / MANAGER A LOS DE SU EQUIPO

    const updateUserId = req.params.id;

    if (req.user.rol !== "ADMIN" && req.user.id !== updateUserId && req.user.rol !== "MANAGER") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const userToUpdate = await userOdm.getUserByIdWithPassword(updateUserId);

    const newLastName = (req.user.id === updateUserId || req.user.rol === "ADMIN") && req.body.lastName ? req.body.lastName : userToUpdate.get("lastName");
    const newFirstName = (req.user.id === updateUserId || req.user.rol === "ADMIN") && req.body.firstName ? req.body.firstName : userToUpdate.get("firstName");
    const newEmail = (req.user.id === updateUserId || req.user.rol === "ADMIN") && req.body.email ? req.body.email : userToUpdate.get("email");
    const newPassword = req.user.id === updateUserId && req.body.password ? await bcrypt.hash(req.body.password, 10) : userToUpdate.get("password");
    const newImage = (req.user.id === updateUserId || req.user.rol === "ADMIN") && req.body.image ? req.body.image : userToUpdate.get("image");
    const newRol = req.user.rol === "ADMIN" ? req.body.rol || userToUpdate.get("rol") : userToUpdate.get("rol");
    const newTeam = (req.user.rol === "MANAGER" && !userToUpdate.get("team")) || (req.user.rol === "MANAGER" && req.user.team?.toString() === userToUpdate.toObject().team?._id.toString()) || req.user.rol === "ADMIN" ? req.body.team : userToUpdate.get("team");

    const userSended: IUserCreate = JSON.parse(JSON.stringify(userToUpdate));
    userSended.rol = newRol;
    userSended.team = newTeam;
    userSended.firstName = newFirstName;
    userSended.lastName = newLastName;
    userSended.email = newEmail;
    userSended.image = newImage;
    userSended.password = newPassword;

    const userSaved = await userOdm.updateUser(updateUserId, userSended);

    res.json(userSaved);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Todos los usuarios creados se puede logar con su password y su email.
    const emailToCheck = req.body.email;
    const passwordToCheck = req.body.password;

    const user = await userOdm.getUserByEmailWithPassword(emailToCheck);
    const userPassword = user.password;

    await compareEncryptedDataWithData(passwordToCheck, userPassword);

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
