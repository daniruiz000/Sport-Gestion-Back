import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { checkPaginatedParams } from "../server/checkPaginatedParams.middleware";

import { teamService } from "../domain/services/team.service";

export const teamRouter = express.Router();

teamRouter.get("/", checkPaginatedParams, decodedUserToken, teamService.getTeamsPaginated);
teamRouter.get("/:id", decodedUserToken, teamService.getTeamById);
teamRouter.get("/name/:name", decodedUserToken, teamService.getTeamByName);
teamRouter.post("/", decodedUserToken, teamService.createTeam);
teamRouter.delete("/:id", decodedUserToken, teamService.deleteTeam);
teamRouter.put("/:id", decodedUserToken, teamService.updateTeam);
