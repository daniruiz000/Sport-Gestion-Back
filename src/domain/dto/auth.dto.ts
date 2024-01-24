import { CustomError } from "../../server/checkError.middleware";
import { ROL, UserAuthInfo } from "../entities/user-entity";
import { userOdm } from "../odm/user.odm";

const itsMySelf = (userId: string, userPassedId: string): boolean => {
  return userId === userPassedId;
};

const iAmManagerAndPlayerIdIsOnMyTeam = async (userRol: ROL, userTeam: string, userToCheckId: string): Promise<boolean> => {
  const userToCheck = await userOdm.getUserById(userToCheckId);

  return userToCheck.team === userTeam && userRol === ROL.MANAGER;
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

const isUserAuthToSpecialAction = async (userAuthInfo: UserAuthInfo, userToDeletedId: string): Promise<void> => {
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

const isStartDateCorrect = (startDate: Date): void => {
  const actualDate: Date = new Date();

  if (!startDate) {
    throw new CustomError("Tiene que introducir una fecha de inicio con formato:'21/5/4' para realizar esta operación.", 404);
  }

  if (actualDate > startDate) {
    throw new CustomError("La fecha tiene que ser posterior a la actual.", 404);
  }
};

export const authDto = {
  isUserRolAuthToAction,
  itsMySelf,
  iAmManagerAndPlayerIdIsOnMyTeam,
  isUserAuthToSpecialAction,
  isStartDateCorrect,
};
