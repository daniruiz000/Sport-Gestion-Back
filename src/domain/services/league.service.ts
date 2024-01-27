import { Request, Response, NextFunction } from "express";

import { ROL, UserAuthInfo } from "../entities/user-entity";

import { matchOdm } from "../odm/match.odm";
import { teamOdm } from "../odm/team.odm";

import { authDto } from "../dto/auth.dto";
import { leagueDto } from "../dto/league.dto";
import { teamStatisticsDto } from "../dto/teamStatics.dto";

export const calculateLeagueStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // NO LOGIN
    const matches = await matchOdm.getAllMatches();

<<<<<<< HEAD
    const statistics = teamStatisticsDto.calculateTeamsStatisticsLeague(matches);
=======
    const statistics = await leagueDto.calculateLeagueStatisticsPerTeam(matches);
>>>>>>> parent of 0e05b6f (f)

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

    const startDateVeryfyAndParsedToDate = leagueDto.checkParsedStartDateForCreateLeague(startDate);

    const teamsInDataBase = await teamOdm.getAllTeams();

    const checkedTeams = leagueDto.checkAreTeamsNumberCorrectPerCreateLeagueAndShuffleIteamArray(teamsInDataBase);

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
