import { Request, Response, NextFunction } from "express";

import { ROL, UserAuthInfo } from "../entities/user-entity";

import { authDto } from "../dto/auth.dto";
import { matchOdm } from "../odm/match.odm";

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
    // ADMIN / REFEREE
    const matchIdToUpdate = req.params.id;
    const userAuthInfo = req.user as UserAuthInfo;
    const matchDataInsert = req.body;

    const matchToUpdate = await matchOdm.getMatchById(matchIdToUpdate);

    await authDto.isReferreInThisMatchOrAdmin(userAuthInfo, matchIdToUpdate);

    Object.assign(matchToUpdate, matchDataInsert);

    const matchToSend = await matchToUpdate.save();

    res.status(200).json(matchToSend);
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
};
