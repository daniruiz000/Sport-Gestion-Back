import { CustomError } from "../../server/checkError.middleware";
import { ROL } from "../entities/user-entity";

const isUserRolAuthForAction = (userAuthInfo: any, authRoles: ROL[]): boolean => {
  let isUserRolAuth = false;

  for (const authRol of authRoles) {
    if (authRol === userAuthInfo.rol) {
      isUserRolAuth = true;
    }
  }
  if (!isUserRolAuth) {
    throw new CustomError("No estás autorizado para realizar la operación.", 409);
  }
  return isUserRolAuth;
};

export const userDto = {
  isUserRolAuthForAction,
};
