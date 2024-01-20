import { mongoConnect, mongoDisconnect } from "../repositories/mongo-repository";
import { resetUsers } from "./resetUsers";

const seedUsers = async (): Promise<void> => {
  try {
    console.log("                                              ")
    console.log("----------------------------------------------")
    console.log("---------------- SEED USERS ----------------")
    console.log("----------------------------------------------")
    console.log("                                              ")
    await mongoConnect();
    await resetUsers()
  } catch (error) {
    console.error(error);
  } finally {
    await mongoDisconnect();
    console.log("                                              ")
    console.log("----------------------------------------------")
    console.log("-------------- PROCESO TERMINADO -------------")
    console.log("----------------------------------------------")
    console.log("                                              ")
  }
};

void seedUsers();
