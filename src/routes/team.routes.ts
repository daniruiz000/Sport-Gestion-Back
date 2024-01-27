import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { checkPaginatedParams } from "../server/checkPaginatedParams.middleware";

import { teamService } from "../domain/services/team.service";

export const teamRouter = express.Router();

teamRouter.get("/", checkPaginatedParams, decodedUserToken, teamService.getTeamsPaginated); // ADMIN
teamRouter.get("/:id", decodedUserToken, teamService.getTeamById); // ADMIN
teamRouter.get("/name/:name", decodedUserToken, teamService.getTeamByName); // ADMIN
teamRouter.post("/", decodedUserToken, teamService.createTeam); // ADMIN
teamRouter.delete("/:id", decodedUserToken, teamService.deleteTeam); // ADMIN
teamRouter.put("/:id", decodedUserToken, teamService.updateTeam); // ADMIN
