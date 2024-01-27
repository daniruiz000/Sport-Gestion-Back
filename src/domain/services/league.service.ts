import { Request, Response, NextFunction } from "express";

import { matchOdm } from "../odm/match.odm";

import { teamStatisticsDto } from "../dto/teamStatics.dto";
import { authDto } from "../dto/auth.dto";
import { leagueDto } from "../dto/league.dto";
import { UserAuthInfo, ROL } from "../entities/user-entity";
import { teamOdm } from "../odm/team.odm";

export const calculateLeagueStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGIN
    const matches = await matchOdm.getAllMatches();

    const statistics = teamStatisticsDto.calculateTeamsStatisticsLeague(matches);

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

    const teamsInDataBase = await teamOdm.getAllTeams();

    const checkedTeams = leagueDto.checkTeamsNumberIsCorrectPerCreateLeagueAndShuffleIteamArray(teamsInDataBase);

    const matchesInLeague = leagueDto.generateMatchesPerLeague(checkedTeams, startDateVeryfyAndParsedToDate);

    await matchOdm.deleteAllMatch();
    await matchOdm.createMatchsFromArray(matchesInLeague);

    matchesInLeague.sort((a, b) => a.round - b.round);

    res.status(200).json(matchesInLeague);
  } catch (error) {
    next(error);
  }
};

export const leagueService = {
  generateLeague,
  calculateLeagueStatistics,
};
