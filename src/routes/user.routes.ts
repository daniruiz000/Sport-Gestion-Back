import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { userService } from "../domain/services/user.service";
import { checkLoginParamsIsCorrect, checkPaginatedParams } from "../server/checkPaginatedParams.middleware";

export const userRouter = express.Router();

userRouter.get("/myuser", decodedUserToken, userService.getMyUserAllInfo); // TODOS LOS LOGADOS A SI MISMOS
userRouter.get("/no-team", decodedUserToken, userService.getPlayersWithoutTeam); // MANAGER / ADMIN
userRouter.get("/:id", decodedUserToken, userService.getUserById); // ADMIN
userRouter.get("/", checkPaginatedParams, decodedUserToken, userService.getUsersPaginated); // ADMIN
userRouter.post("/", userService.createUser); // NO REGISTRADO / POSIBILITA HACER LOGIN
userRouter.delete("/:id", decodedUserToken, userService.deleteUser); // TODOS LOS LOGADOS A SI MISMOS / ADMIN / MANAGER PUEDE BORRAR A LOS JUGADORES DE SU EQUIPO
userRouter.put("/:id", decodedUserToken, userService.updateUser); // TODOS LOS LOGADOS A SI MISMOS PERO NO EL ROL / MANAGER PUEDE MODIFICAR A LOS JUGADORES DE SU EQUIPO / ADMIN
userRouter.post("/login", checkLoginParamsIsCorrect, userService.login); // REGISTRADO
