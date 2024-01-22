import { mongoConnect, mongoDisconnect } from "../../repositories/mongo-repository";
import { resetTeams } from "./resetTeams";

const seedTeams = async (): Promise<void> => {
  try {
    console.log("                                              ");
    console.log("----------------------------------------------");
    console.log("---------------- SEED TEAMS ----------------");
    console.log("----------------------------------------------");
    console.log("                                              ");
    await mongoConnect();
    await resetTeams();
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

void seedTeams();
