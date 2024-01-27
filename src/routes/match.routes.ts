import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { matchService } from "../domain/services/match.service";

export const matchRouter = express.Router();

matchRouter.get("/:id", matchService.getMatchById); // NO LOGIN
matchRouter.get("/byRound/:round", matchService.getMatchesByRound); // NO LOGIN
matchRouter.get("/", matchService.getAllMatches); // NO LOGIN
matchRouter.post("/", decodedUserToken, matchService.createMatch); // ADMIN
matchRouter.delete("/:id", decodedUserToken, matchService.deleteMatch); // ADMIN
matchRouter.put("/:id", decodedUserToken, matchService.updateMatch); // ADMIN / REFEREE
