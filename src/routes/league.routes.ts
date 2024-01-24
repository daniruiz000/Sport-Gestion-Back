import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { leagueService } from "../domain/services/league.service";

export const leagueRouter = express.Router();

leagueRouter.get("/calculate-statics", leagueService.calculateLeagueStatisticsByTeams); // NO LOGADO
leagueRouter.post("/generate-league", decodedUserToken, leagueService.generateLeague); // ADMIN
