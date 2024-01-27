import { Request, Response, NextFunction } from "express";

import { matchOdm } from "../odm/match.odm";

import { teamStatisticsDto } from "../dto/teamStatics.dto";

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

export const leagueService = {
  calculateLeagueStatistics,
};
