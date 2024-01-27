import { CustomError } from "../../server/checkError.middleware";

import { ROL, UserAuthInfo } from "../entities/user-entity";
import { matchOdm } from "../odm/match.odm";
import { teamOdm } from "../odm/team.odm";

import { userOdm } from "../odm/user.odm";

const itsMySelf = (userId: string, userPassedId: string): boolean => {
  return userId === userPassedId;
};

const iAmManagerAndItsMyTeamOrAdmin = async (userAuthInfo: UserAuthInfo, idTeam: string): Promise<void> => {
  isUserRolAuthToAction(userAuthInfo, [ROL.ADMIN, ROL.MANAGER]);

  const team = await teamOdm.getTeamById(idTeam);

  if (!team) {
    throw new CustomError("No estás autorizado para realizar la operación.", 401);
  }
};

const iAmManagerAndPlayerIdIsOnMyTeam = async (userRol: ROL, userTeam: string, userToCheckId: string): Promise<boolean> => {
  const userToCheck = await userOdm.getUserById(userToCheckId);

  return userToCheck.team === userTeam && userRol === ROL.MANAGER;
};

const isReferreInThisMatchOrAdmin = async (userAuthInfo: UserAuthInfo, idMatch: string): Promise<boolean> => {
  let isUserAuth = false;

  const refereeInMatch = await matchOdm.getReferreInMatch(idMatch);

  if (userAuthInfo.id === refereeInMatch.id || userAuthInfo.rol === ROL.ADMIN) {
    isUserAuth = true;
  }

  return isUserAuth;
};

const isUserRolAuthToAction = (userAuthInfo: UserAuthInfo, authRoles: ROL[]): void => {
  let isUserRolAuth = false;

  for (const authRol of authRoles) {
    if (authRol === userAuthInfo.rol) {
      isUserRolAuth = true;
    }
  }

  if (!isUserRolAuth) {
    throw new CustomError("No estás autorizado para realizar la operación.", 401);
  }
};

const itsMySelfOrAmManagerAndPlayerIdIsOnMyTeamOrAmAdmin = async (userAuthInfo: UserAuthInfo, userToDeletedId: string): Promise<void> => {
  const userId = userAuthInfo.id;
  const userRol = userAuthInfo.rol;
  const userTeam = userAuthInfo.team;

  const itsMySelf = authDto.itsMySelf(userId, userToDeletedId);
  const iAmManagerAndPlayerIdIsOnMyTeam = await authDto.iAmManagerAndPlayerIdIsOnMyTeam(userRol, userTeam, userToDeletedId);
  const iAmAdmin = userRol === ROL.ADMIN;

  const isAuth = itsMySelf || iAmManagerAndPlayerIdIsOnMyTeam || iAmAdmin;

  if (!isAuth) {
    throw new CustomError("No estás autorizado para realizar la operación.", 401);
  }
};

export const authDto = {
  isUserRolAuthToAction,
  itsMySelf,
  iAmManagerAndItsMyTeamOrAdmin,
  isReferreInThisMatchOrAdmin,
  iAmManagerAndPlayerIdIsOnMyTeam,
  itsMySelfOrAmManagerAndPlayerIdIsOnMyTeamOrAmAdmin,
};
