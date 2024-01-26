import { Request, Response, NextFunction } from "express";
import { authDto } from "../dto/auth.dto";
import { leagueDto } from "../dto/league.dto";
import { UserAuthInfo, ROL } from "../entities/user-entity";
import { matchOdm } from "../odm/match.odm";

export const calculateTeamStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGIN
    const matches = await matchOdm.getAllMatches();

    const statistics = await leagueDto.calculateTeamStatisticsFunction(matches);

    res.status(200).json(statistics);
  } catch (error) {
    next(error);
  }
};

export const generateLeague = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // ADMIN
    const userAuthInfo = req.user as UserAuthInfo;
    const startDate = req.body.startDate;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    const startDateVeryfyAndParsedToDate = leagueDto.validateAndParsedStartDateForCreateLeague(startDate);

    const matchs = await leagueDto.generateLeagueFunction(startDateVeryfyAndParsedToDate);

    res.status(200).json(matchs);
  } catch (error) {
    next(error);
  }
};

export const leagueService = {
  generateLeague,
  calculateTeamStatistics,
};
