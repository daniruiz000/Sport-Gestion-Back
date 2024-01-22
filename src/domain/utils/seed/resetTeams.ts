import { teamList } from "../../../data";
import { teamOdm } from "../../odm/team.odm";

/* Borramos datos de la colección teams y creamos teams
 con los datos que suministramos en data.ts */

export const resetTeams = async (): Promise<void> => {
  try {
    await teamOdm.deleteAllTeams();
    console.log("Borrados teams");
    await teamOdm.createTeamsFromArray(teamList);
    console.log("Creados teams correctamente");
    console.log({ teams: teamList.length });
  } catch (error) {
    console.error(error);
  }
};
