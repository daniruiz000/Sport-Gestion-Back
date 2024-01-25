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
    const actualDate: Date = new Date();
    const userAuthInfo = req.user as UserAuthInfo;

    authDto.isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN]);

    if (!req.body.startDate) {
      res.status(404).json({ error: "Tiene que introducir una fecha de inicio con formato:'21/5/4' para realizar esta operación" });
      return;
    }

    const startDate = leagueDto.convertDateStringToDate(req.body.startDate);

    if (actualDate > startDate) {
      res.status(404).json("La fecha tiene que ser posterior a la actual");
      return;
    }

    const matchs = await leagueDto.generateLeagueFunction(startDate);

    res.status(200).json(matchs);
  } catch (error) {
    next(error);
  }
};

export const leagueService = {
  generateLeague,
  calculateTeamStatistics,
};
