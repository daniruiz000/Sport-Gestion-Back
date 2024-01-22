import express from "express";

import { isAuth } from "../domain/services/auth.middleware";
import { userService } from "../domain/services/user.service";
import { checkLoginParamsIsCorrect, checkPaginatedParams } from "../server/checkPaginatedParams.middleware";

export const userRouter = express.Router();

userRouter.get("/myuser", isAuth, userService.getMyUserAllInfo); // TODOS LOS LOGADOS A SI MISMOS
userRouter.get("/no-team", isAuth, userService.getPlayersWithoutTeam); // MANAGER / ADMIN
userRouter.get("/", checkPaginatedParams, isAuth, userService.getUsersPaginated); // ADMIN
userRouter.get("/:id", isAuth, userService.getUserById); // ADMIN
userRouter.post("/", userService.createUser); // NO REGISTRADO / POSIBILITA HACER LOGIN
userRouter.delete("/:id", isAuth, userService.deleteUser); // TODOS LOS LOGADOS A SI MISMOS / ADMIN / MANAGER PUEDE BORRAR A LOS JUGADORES DE SU EQUIPO
userRouter.put("/:id", isAuth, userService.updateUser); // TODOS LOS LOGADOS A SI MISMOS PERO NO EL ROL / MANAGER PUEDE MODIFICAR A LOS JUGADORES DE SU EQUIPO / ADMIN
userRouter.post("/login", checkLoginParamsIsCorrect, userService.login); // REGISTRADO
