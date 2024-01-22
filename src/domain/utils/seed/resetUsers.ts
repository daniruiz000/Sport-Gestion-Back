import { userList } from "../../../data";
import { Team } from "../../entities/team-entity";
import { ROL, IUserCreate } from "../../entities/user-entity";
import { userOdm } from "../../odm/user.odm";

export const resetUsers = async (): Promise<void> => {
  try {
    const playersWithTeam = 50;
    await userOdm.deleteAllUsers();
    console.log("Usuarios borrados");

    const admins = userList.filter((user) => user.rol === ROL.ADMIN);
    const managers = userList.filter((user) => user.rol === ROL.MANAGER);
    const players = userList.filter((user) => user.rol === ROL.PLAYER);
    const teams = await Team.find();
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
      users: userList.length,
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
