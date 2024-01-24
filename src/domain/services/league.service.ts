import { Request, Response, NextFunction } from "express";

import { UserAuthInfo, ROL } from "../entities/user-entity";
import { matchOdm } from "../odm/match.odm";
import { authDto } from "../dto/auth.dto";
import { leagueDto } from "../dto/league.dto";

import { convertDateStringToDate } from "../../utils/convertDateStringToDate";

export const calculateLeagueStatisticsByTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGIN
    const matches = await matchOdm.getAllMatches();

    const leagueStaticsByTeams = await leagueDto.calculateLeagueStatisticsForTeamsAndSortByPosition(matches);

    res.status(200).json(leagueStaticsByTeams);
  } catch (error) {
    next(error);
  }
};

export const generateLeague = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const userAuthInfo = req.user as UserAuthInfo;
    const startDateParsed = convertDateStringToDate(req.body.startDate);

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    authDto.isStartDateCorrect(startDateParsed);

    const matchs = await leagueDto.generateLeague(startDateParsed);

    res.status(200).json(matchs);
  } catch (error) {
    next(error);
  }
};

export const leagueService = {
  generateLeague,
  calculateLeagueStatisticsByTeams,
};
