import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { userService } from "../domain/services/user.service";
import { checkLoginParamsIsCorrect, checkPaginatedParams } from "../server/checkPaginatedParams.middleware";

export const userRouter = express.Router();

userRouter.get("/myuser", decodedUserToken, userService.getMyUserAllInfo); // TODOS LOS LOGADOS A SI MISMOS
userRouter.get("/no-team", decodedUserToken, userService.getPlayersWithoutTeam); // ADMIN / MANAGER
userRouter.get("/:id", decodedUserToken, userService.getUserById); // ADMIN
userRouter.get("/", checkPaginatedParams, decodedUserToken, userService.getUsersPaginated); // ADMIN
userRouter.post("/", userService.createUser); // NO REGISTRADO / POSIBILITA HACER LOGIN
userRouter.delete("/:id", decodedUserToken, userService.deleteUser); // ADMIN /TODOS LOS LOGADOS A SI MISMOS / MANAGER PUEDE BORRAR A LOS JUGADORES DE SU EQUIPO
userRouter.put("/:id", decodedUserToken, userService.updateUser); // ADMIN /TODOS LOS LOGADOS A SI MISMOS PERO NO EL ROL NI LA PASSWORD/ MANAGER PUEDE MODIFICAR A LOS JUGADORES DE SU EQUIPO PERO NO EL ROL NI LA PASSWORD
userRouter.post("/login", checkLoginParamsIsCorrect, userService.login); // REGISTRADO
