import { mongoConnect, mongoDisconnect } from "../../repositories/mongo-repository"; // Importamos el archivo de conexión a la BBDD

import { IMatchCreate } from "../../entities/match-entity";
import { resetTeams } from "./resetTeams";
import { resetUsers } from "./resetUsers";

import { generateLeagueWithData } from "./generateLeagueWithData";
import { convertDateStringToDate } from "../../../utils/convertDateStringToDate";

const seedLaLiga = async (): Promise<IMatchCreate[] | undefined> => {
  try {
    console.log("                                              ");
    console.log("----------------------------------------------");
    console.log("---------------- SEED LALIGA -----------------");
    console.log("----------------------------------------------");
    console.log("                                              ");
    await mongoConnect();
    await resetTeams();
    await resetUsers();
    const startDate = convertDateStringToDate("22/5/22");
    const matchesInLeagueWithData = await generateLeagueWithData(startDate);

    return matchesInLeagueWithData;
  } catch (error) {
    console.error(error);
  } finally {
    await mongoDisconnect();
    console.log("                                              ");
    console.log("----------------------------------------------");
    console.log("-------------- PROCESO TERMINADO -------------");
    console.log("----------------------------------------------");
    console.log("                                              ");
  }
};

void seedLaLiga();
