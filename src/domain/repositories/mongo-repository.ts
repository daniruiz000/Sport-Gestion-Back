// Cargamos variables de entorno
// Importamos librerías
import mongoose, { Mongoose, connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_CONNECTION: string | undefined = process.env.DB_URL;
const DB_NAME: string | undefined = process.env.DB_NAME;

// Configuración de la conexión a Mongo
const config = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  dbName: DB_NAME,
};

export const mongoConnect = async (): Promise<Mongoose | null> => {
  try {
    if (typeof DB_CONNECTION !== "string") {
      throw new Error("No hay bbdd seleccionada");
    } else {
      const database: Mongoose = await connect(DB_CONNECTION, config);
      const { name, host } = database.connection;
      console.log(`Conectado a la base de datos ${name} en el host ${host}`);

      return database;
    }
  } catch (error) {
    console.error(error);
    console.log("Error en la conexión, intentando conectar en 5s...");
    setTimeout(mongoConnect, 5000);

    return null;
  }
};

export const mongoDisconnect = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("Desconectado de la base de datos");
  } catch (error) {
    console.error(error);
    console.log("Error en la desconexión, intentando desconectar en 5s...");
    setTimeout(mongoDisconnect, 5000);
  }
};
