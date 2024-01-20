import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";

import { generateToken } from "../utils/token";
import { userDto } from "../dto/user.dto";
import { matchOdm } from "../odm/match.odm";
import { ROL } from "../entities/user-entity";
import { CustomError } from "../../server/checkError.middleware";

export const getUsersPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const userRol = req.user.rol;

    // ADMIN
    userDto.isUserAuthForAction(userRol, [ROL.ADMIN]);

    const users = await userDto.getAllUsersPaginated(page, limit);
    const totalElements = await userDto.getUserCount();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: users,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getMyUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / EL PROPIO USUARIO A SÍ MISMO (CUALQUIER USUARIO LOGADO)
    const user = await userDto.getUserById(req.user.id as string);
    const playersOnMyTeam = await userDto.getPlayersByIdTeam(req.user.team as string);
    const matchsOnMyTeam = await matchOdm.getMatchsByTeamId(req.user.team as string);
    const response = {
      user,
      playersOnMyTeam: req.user.rol === ROL.ADMIN ? [] : playersOnMyTeam,
      matchsOnMyTeam,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getPlayersWithoutTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userRol = req.user.rol;
    //  ADMIN / MANAGER
    userDto.isUserAuthForAction(userRol, [ROL.ADMIN, ROL.MANAGER]);

    const players = await userDto.getPlayersWithoutTeam();
    if (!players.length) {
      res.status(404).json({ error: "No existen jugadores sin equipo" });
    } else {
      res.json(players);
    }
  } catch (error) {
    next(error);
  }
};

export const getUsersByMyTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // MANAGER
    if (req.user.rol !== "PLAYER" && req.user.rol !== "MANAGER") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }
    const teamId = req.user.team;
    if (teamId) {
      const players = await userDto.getPlayersByIdTeam(teamId);
      if (!players) {
        res.status(404).json({ error: "No existen jugadores para este equipo" });
        return;
      }
      const manager = await userDto.getManagerByIdTeam(teamId);
      if (!manager) {
        res.status(404).json({ error: "No existe manager para este equipo" });
        return;
      }
      const matchs = await matchOdm.getMatchsByTeamId(teamId);
      if (!matchs) {
        res.status(404).json({ error: "No existe partidos para este equipo" });
        return;
      }
      const response = {
        players,
        manager,
        matchs,
      };
      res.json(response);
    } else {
      res.status(404).json({ error: "No tienes equipo asignado" });
    }
  } catch (error) {
    next(error);
  }
};

export const getUsersByTeamId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN
    if (req.user.rol !== "ADMIN") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }
    const teamId = req.params.team;

    if (!teamId) {
      res.status(404).json({ error: "Tienes que introducir un id de equipo" });
      return;
    }

    const players = await userDto.getPlayersByIdTeam(teamId);
    const manager = await userDto.getManagerByIdTeam(teamId);

    const response = {
      players,
      manager,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN
    if (req.user.rol !== "ADMIN") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const id = req.params.id;
    const user = await userDto.getUserById(id);
    if (!user) {
      res.status(404).json({ error: "No existe el usuario" });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGADO
    const createdUser = await userDto.createUser(req.body);
    res.status(201).json(createdUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / EL PROPIO USUARIO A SÍ MISMO (CUALQUIER USUARIO LOGADO)
    const deletedUserId = req.params.id;
    if (req.user.rol !== "ADMIN" && req.user.id !== deletedUserId) {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const userDeleted = await userDto.deleteUser(deletedUserId);
    if (!userDeleted) {
      res.status(404).json({ error: "No existe el usuario" });
      return;
    }
    res.json(userDeleted);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updateUserId = req.params.id;

    // Solo ADMIN o el propio usuario a sí mismo (cualquier usuario logado) / MANAGER A LOS DE SU EQUIPO
    if (req.user.rol !== "ADMIN" && req.user.id !== updateUserId && req.user.rol !== "MANAGER") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const userToUpdate = await userDto.getUserById(updateUserId);
    if (!userToUpdate) {
      res.status(404).json({ error: "No existe el usuario para actualizar" });
      return;
    }

    // Guardamos el usuario actualizándolo con los parámetros que nos manden
    const newLastName = (req.user.id === updateUserId || req.user.rol === "ADMIN") && req.body.lastName ? req.body.lastName : userToUpdate.get("lastName");
    const newFirstName = (req.user.id === updateUserId || req.user.rol === "ADMIN") && req.body.firstName ? req.body.firstName : userToUpdate.get("firstName");
    const newEmail = (req.user.id === updateUserId || req.user.rol === "ADMIN") && req.body.email ? req.body.email : userToUpdate.get("email");
    const newPassword = req.body.password;
    const newImage = (req.user.id === updateUserId || req.user.rol === "ADMIN") && req.body.image ? req.body.image : userToUpdate.get("image");
    const newRol = req.user.rol === "ADMIN" ? req.body.rol || userToUpdate.get("rol") : userToUpdate.get("rol");
    const newTeam = (req.user.rol === "MANAGER" && !userToUpdate.get("team")) || (req.user.rol === "MANAGER" && req.user.team?.toString() === userToUpdate.toObject().team?._id.toString()) || req.user.rol === "ADMIN" ? req.body.team : userToUpdate.get("team");

    if (req.body.password) {
      const userSended = { ...req.body, rol: newRol, team: newTeam, firstName: newFirstName, lastName: newLastName, email: newEmail, password: newPassword, image: newImage };
      Object.assign(userToUpdate, userSended);
      await userToUpdate.save();
    } else {
      const userSended = { ...req.body, rol: newRol, team: newTeam, firstName: newFirstName, lastName: newLastName, email: newEmail, image: newImage };
      Object.assign(userToUpdate, userSended);

      await userToUpdate.save();
    }

    // Quitamos la contraseña y el rol del usuario que enviamos en la respuesta
    const userToSend: any = userToUpdate.toObject();
    delete userToSend.password;
    delete userToSend.rol;
    res.json(userToSend);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    // Todos los usuarios creados se puede logar con su password y su email
    if (!email || !password) {
      throw new CustomError("Se deben especificar los campos email y password", 400);
    }

    const user: any = await userDto.getUserByEmailWithPassword(email);
    if (!user) {
      throw new CustomError("Email y/o contraseña incorrectos.", 401);
    }
    // Comprueba la password
    const userPassword: string = user.password;
    const match = await bcrypt.compare(password, userPassword);
    if (!match) {
      throw new CustomError("Contraseña incorrecta.", 401);
    }
    // Generamos token JWT

    const userToSend = user.toObject(user);
    delete userToSend.password;
    const jwtToken = generateToken(user._id.toString(), user.email, userToSend.rol);

    res.status(200).json({
      token: jwtToken,
    });
  } catch (error) {
    next(error);
  }
};

export const userService = {
  getMyUser,
  getUsersByMyTeam,
  getUsersByTeamId,
  getPlayersWithoutTeam,
  getUsersPaginated,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  login,
};
