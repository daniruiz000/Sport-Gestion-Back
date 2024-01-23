import { MyUser, ROL } from "../entities/user-entity";
import { userOdm } from "../odm/user.odm";
import { UserAuthInfo } from "../../server/decodedUserToken.middleware";
import { matchOdm } from "../odm/match.odm";

const getMyUserAllInfo = async (userAuthInfo: UserAuthInfo): Promise<MyUser> => {
  const myUser = await userOdm.getUserById(userAuthInfo.id);
  const playersOnMyTeam = await userOdm.getPlayersByIdTeam(userAuthInfo.team);
  const matchsOnMyTeam = await matchOdm.getMatchsByTeamId(userAuthInfo.team);
  const manager = userAuthInfo.rol === ROL.MANAGER ? userAuthInfo.id : await userOdm.getManagerByIdTeam(userAuthInfo.team);

  const response = {
    myUser,
    playersOnMyTeam: userAuthInfo.rol === ROL.ADMIN ? null : playersOnMyTeam,
    matchsOnMyTeam: userAuthInfo.rol === ROL.ADMIN ? null : matchsOnMyTeam,
    manager: userAuthInfo.rol === ROL.ADMIN ? null : manager,
  };

  return response;
};

export const userDto = {
  getMyUserAllInfo,
};
