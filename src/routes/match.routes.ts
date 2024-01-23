import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { matchService } from "../domain/services/match.service";
import { checkPaginatedParams } from "../server/checkPaginatedParams.middleware";

export const matchRouter = express.Router();

matchRouter.get("/calculate-statics", matchService.calculateTeamStatistics);
matchRouter.get("/matchall", matchService.getAllMatchs);
matchRouter.get("/", checkPaginatedParams, matchService.getMatchs);
matchRouter.get("/:id", matchService.getMatchById);
matchRouter.post("/", decodedUserToken, matchService.createMatch);
matchRouter.delete("/:id", decodedUserToken, matchService.deleteMatch);
matchRouter.post("/generate-league", decodedUserToken, matchService.generateLeague);
matchRouter.put("/:id", decodedUserToken, matchService.updateMatch);
