import { Request, Response, NextFunction } from "express";

import { UserAuthInfo, ROL } from "../entities/user-entity";
import { authDto } from "../dto/auth.dto";
import { matchOdm } from "../odm/match.odm";

import { generateLeagueFunction } from "../utils/generateLeagueFunction";
import { convertDateStringToDate } from "../../utils/convertDateStringToDate";
import { calculateTeamStatisticsFunction } from "../utils/calculateTeamStatisticsFunction";

export const getAllMatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGIN
    const matches = await matchOdm.getAllMatches();

    res.status(200).json(matches);
  } catch (error) {
    next(error);
  }
};

export const getMatchById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGIN
    const matchId = req.params.id;
    const match = await matchOdm.getMatchById(matchId);

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

export const getMatchesByRound = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGIN
    const round = req.params.round;
    const matches = await matchOdm.getMatchesByRound(round);

    res.status(200).json(matches);
  } catch (error) {
    next(error);
  }
};

export const createMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const createdMatch = await matchOdm.createMatch(req.body);

    res.status(201).json(createdMatch);
  } catch (error) {
    next(error);
  }
};

export const deleteMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const id = req.params.id;
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const matchDeleted = await matchOdm.deleteMatch(id);

    res.status(201).json(matchDeleted);
  } catch (error) {
    next(error);
  }
};

export const updateMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const id = req.params.id;
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const matchToUpdate = await matchOdm.getMatchById(id);

    Object.assign(matchToUpdate, req.body);

    const matchToSend = await matchToUpdate.save();

    res.status(200).json(matchToSend);
  } catch (error) {
    next(error);
  }
};

export const calculateTeamStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGIN
    const matches = await matchOdm.getAllMatches();

    const statistics = await calculateTeamStatisticsFunction(matches);

    res.status(200).json(statistics);
  } catch (error) {
    next(error);
  }
};

export const generateLeague = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const actualDate: Date = new Date();
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    if (!req.body.startDate) {
      res.status(404).json({ error: "Tiene que introducir una fecha de inicio con formato:'21/5/4' para realizar esta operación" });
      return;
    }

    const startDate = convertDateStringToDate(req.body.startDate);

    if (actualDate > startDate) {
      res.status(404).json("La fecha tiene que ser posterior a la actual");
      return;
    }

    const matchs = await generateLeagueFunction(startDate);

    res.status(200).json(matchs);
  } catch (error) {
    next(error);
  }
};

export const matchService = {
  getAllMatches,
  getMatchById,
  getMatchesByRound,
  createMatch,
  deleteMatch,
  updateMatch,
  generateLeague,
  calculateTeamStatistics,
};
