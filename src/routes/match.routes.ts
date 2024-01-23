import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { matchService } from "../domain/services/match.service";

export const matchRouter = express.Router();

matchRouter.get("/:id", matchService.getMatchById);
matchRouter.get("/byRound/:round", matchService.getMatchesByRound);
matchRouter.get("/", matchService.getAllMatches);
matchRouter.post("/", decodedUserToken, matchService.createMatch);
matchRouter.delete("/:id", decodedUserToken, matchService.deleteMatch);
matchRouter.put("/:id", decodedUserToken, matchService.updateMatch);
matchRouter.get("/calculate-statics", matchService.calculateTeamStatistics);
matchRouter.post("/generate-league", decodedUserToken, matchService.generateLeague);
