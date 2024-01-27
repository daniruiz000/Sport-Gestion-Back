import { ROL, IUserCreate } from "../../entities/user-entity";

import { teamOdm } from "../../odm/team.odm";
import { userOdm } from "../../odm/user.odm";
import { createRandomUserArray } from "./generateRandomData";

export const resetUsers = async (): Promise<void> => {
  try {
    const playersWithTeam = 50;
    await userOdm.deleteAllUsers();
    console.log("Usuarios borrados");

    const admins = createRandomUserArray(ROL.ADMIN, 5);
    const managers = createRandomUserArray(ROL.MANAGER, 10);
    const players = createRandomUserArray(ROL.PLAYER, 60);

    const teams = await teamOdm.getAllTeams();

    const playersPerTeam = playersWithTeam / teams.length;
    const playersNoTeam = players.length - 50;

    for (let i = 0; i < playersWithTeam; i++) {
      const player: IUserCreate = players[i];
      player.team = teams[i % teams.length].id;
      await userOdm.createUser(player);
    }
    console.log("Players creados y asignados a equipos correctamente");

    for (let i = 0; i < playersNoTeam; i++) {
      const player: IUserCreate = players[i + playersWithTeam];
      await userOdm.createUser(player);
    }
    console.log("Players sin equipo creados correctamente");

    for (let i = 0; i < managers.length; i++) {
      const manager: IUserCreate = managers[i];
      manager.team = teams[i % teams.length].id;
      await userOdm.createUser(manager);
    }
    console.log("Managers creados y asignados a equipos correctamente");

    for (const admin of admins) {
      await userOdm.createUser(admin);
    }
    console.log("Admins creados correctamente");

    console.log("Usuarios y relaciones con equipos creados correctamente");
    console.log({
      users: players.length + managers.length + admins.length,
      players: players.length,
      playersWithTeam,
      playersNoTeam,
      managers: managers.length,
      admins: admins.length,
      playersPerTeam,
    });
  } catch (error) {
    console.error(error);
  }
};
