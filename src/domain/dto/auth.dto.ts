import { CustomError } from "../../server/checkError.middleware";
import { ROL } from "../entities/user-entity";
import { userOdm } from "../odm/user.odm";
import { UserAuthInfo } from "../../server/decodedUserToken.middleware";

const itsMySelf = (userId: string, userPassedId: string): boolean => {
  return userId === userPassedId;
};

export const isPlayerOnMyTeam = async (userRol: ROL, userTeam: string, userToCheckId: string): Promise<boolean> => {
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
    throw new CustomError("No estás autorizado para realizar la operación.", 409);
  }
};

const isUserAuthToSpecialAction = async (userAuthInfo: UserAuthInfo, userToDeletedId: string): Promise<void> => {
  const userId = userAuthInfo.id;
  const userRol = userAuthInfo.rol;
  const userTeam = userAuthInfo.team;

  const itsMySelf = authDto.itsMySelf(userId, userToDeletedId);
  const itsInMyTeam = await authDto.isPlayerOnMyTeam(userRol, userTeam, userToDeletedId);

  const isAuth = itsMySelf || itsInMyTeam || userRol === ROL.ADMIN;

  if (!isAuth) {
    throw new CustomError("No estás autorizado para realizar la operación.", 409);
  }
};

export const authDto = {
  isUserRolAuthToAction,
  itsMySelf,
  isPlayerOnMyTeam,
  isUserAuthToSpecialAction,
};
