import { Request, Response, NextFunction } from "express";

import { ROL, UserAuthInfo } from "../entities/user-entity";

import { teamOdm } from "../odm/team.odm";
import { userOdm } from "../odm/user.odm";
import { authDto } from "../dto/auth.dto";

export const getTeamsPaginated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const teams = await teamOdm.getAllTeamsPaginated(page, limit);

    const newTeams = [];
    for (const team of teams) {
      const manager = await userOdm.getManagerByIdTeam(team.id);
      const newTeam = {
        team,
        manager,
      };
      newTeams.push(newTeam);
    }
    const totalElements = await teamOdm.getTeamCount();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: newTeams,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN

    const teamId = req.params.id;
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const team = await teamOdm.getTeamById(teamId);

    res.json(team);
  } catch (error) {
    next(error);
  }
};

export const getTeamByName = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN

    const name = req.params.name;
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const team = await teamOdm.getTeamByName(name);

    res.json(team);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN

    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const createdTeam = await teamOdm.createTeam(req.body);

    res.status(201).json(createdTeam);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / MANAGER a su propio equipo

    const id = req.params.id;

    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const teamDeleted = await teamOdm.deleteTeam(id);

    res.json(teamDeleted);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN / MANAGER a su propio equipo

    const id = req.params.id;

    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const teamToUpdate = await teamOdm.getTeamById(id);

    Object.assign(teamToUpdate, req.body);

    const teamToSend = await teamToUpdate.save();

    res.json(teamToSend);
  } catch (error) {
    next(error);
  }
};

export const teamService = {
  getTeamsPaginated,
  getTeamById,
  getTeamByName,
  createTeam,
  deleteTeam,
  updateTeam,
};
